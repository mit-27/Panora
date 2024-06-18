import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/logger/logger.service';
import { throwTypedError, WebhooksError } from '@@core/utils/errors';
import { WebhookDto } from './dto/webhook.dto';
import axios from 'axios';
import crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('webhookDelivery') private queue: Queue,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(WebhookService.name);
  }

  generateSignature(payload: any, secret: string): string {
    try {
      return crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'SIGNATURE_GENERATION_ERROR',
          message: 'WebhookService.generateSignature() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async getWebhookEndpoints(project_id: string) {
    try {
      return await this.prisma.webhook_endpoints.findMany({
        where: {
          id_project: project_id,
        },
      });
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'GET_WEBHOOKS_ERROR',
          message: 'WebhookService.getWebhookEndpoints() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async updateStatusWebhookEndpoint(id: string, active: boolean) {
    try {
      return await this.prisma.webhook_endpoints.update({
        where: { id_webhook_endpoint: id },
        data: { active: active },
      });
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'UPDATE_WEBHOOK_STATUS_ERROR',
          message: 'WebhookService.updateStatusWebhookEndpoint() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async createWebhookEndpoint(data: WebhookDto) {
    try {
      return await this.prisma.webhook_endpoints.create({
        data: {
          id_webhook_endpoint: uuidv4(),
          url: data.url,
          endpoint_description: data.description ? data.description : '',
          secret: uuidv4(),
          active: true,
          created_at: new Date(),
          id_project: data.id_project,
          scope: data.scope,
        },
      });
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'CREATE_WEBHOOK_ERROR',
          message: 'WebhookService.createWebhookEndpoint() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async deleteWebhook(whId: string) {
    try {
      return await this.prisma.webhook_endpoints.delete({
        where: {
          id_webhook_endpoint: whId,
        },
      });
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'DELETE_WEBHOOK_ERROR',
          message: 'WebhookService.deleteWebhook() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async handleWebhook(
    data: any,
    eventType: string,
    projectId: string,
    eventId: string,
  ) {
    try {
      this.logger.log(
        `Handling Panora Webhook for event: ${eventType} and projectId: ${projectId}`,
      );
      //just create an entry in webhook
      //search if an endpoint webhook exists for such a projectId and such a scope
      const webhooks = await this.prisma.webhook_endpoints.findMany({
        where: {
          id_project: projectId,
          active: true,
        },
      });

      // we dont deliver the webhook
      if (!webhooks) return;

      const webhook = webhooks.find((wh) => {
        const scopes = wh.scope;
        return scopes.includes(eventType);
      });

      // we dont deliver the webhook
      if (!webhook) return;

      this.logger.log('handling webhook payload....');

      const w_payload = await this.prisma.webhooks_payloads.create({
        data: {
          id_webhooks_payload: uuidv4(),
          data: JSON.stringify(data),
        },
      });
      this.logger.log('handling webhook delivery....');

      const w_delivery = await this.prisma.webhook_delivery_attempts.create({
        data: {
          id_webhook_delivery_attempt: uuidv4(),
          id_event: eventId,
          timestamp: new Date(),
          id_webhook_endpoint: webhook.id_webhook_endpoint,
          status: 'queued', // queued | processed | failed | success
          id_webhooks_payload: w_payload.id_webhooks_payload,
          attempt_count: 0,
        },
      });
      this.logger.log('adding webhook to the queue ');
      // we send the delivery webhook to the queue so it can be processed by our dispatcher worker
      const job = await this.queue.add({
        webhook_delivery_id: w_delivery.id_webhook_delivery_attempt,
      });
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'DELIVERING_WEBHOOK_ERROR',
          message: 'WebhookService.handleWebhook() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async handlePriorityWebhook(
    data: any,
    eventType: string,
    projectId: string,
    eventId: string,
  ) {
    try {
      this.logger.log('handling webhook....');
      //just create an entry in webhook
      //search if an endpoint webhook exists for such a projectId and such a scope
      const webhooks = await this.prisma.webhook_endpoints.findMany({
        where: {
          id_project: projectId,
          active: true,
        },
      });
      if (!webhooks) return;

      const webhook = webhooks.find((wh) => {
        const scopes = wh.scope;
        return scopes.includes(eventType);
      });

      if (!webhook) return;

      this.logger.log('handling webhook payload....');

      const w_payload = await this.prisma.webhooks_payloads.create({
        data: {
          id_webhooks_payload: uuidv4(),
          data: JSON.stringify(data),
        },
      });
      this.logger.log('handling webhook delivery....');

      const w_delivery = await this.prisma.webhook_delivery_attempts.create({
        data: {
          id_webhook_delivery_attempt: uuidv4(),
          id_event: eventId,
          timestamp: new Date(),
          id_webhook_endpoint: webhook.id_webhook_endpoint,
          status: 'processed', // queued | processed | failed | success
          id_webhooks_payload: w_payload.id_webhooks_payload,
          attempt_count: 0,
        },
      });
      this.logger.log('sending the webhook to the client ');
      // we send the delivery webhook to the queue so it can be processed by our dispatcher worker
      // Retrieve the webhook delivery attempt details
      const deliveryAttempt =
        await this.prisma.webhook_delivery_attempts.findUnique({
          where: {
            id_webhook_delivery_attempt: w_delivery.id_webhook_delivery_attempt,
          },
          include: {
            webhook_endpoints: true,
            webhooks_payloads: true,
          },
        });

      // Check if the endpoint is active
      if (deliveryAttempt.webhook_endpoints.active) {
        try {
          // Send the payload to the endpoint URL
          const response = await axios.post(
            deliveryAttempt.webhook_endpoints.url,
            {
              id_event: deliveryAttempt.id_event,
              data: deliveryAttempt.webhooks_payloads.data,
            },
            {
              headers: {
                'Panora-Signature': this.generateSignature(
                  deliveryAttempt.webhooks_payloads.data,
                  deliveryAttempt.webhook_endpoints.secret,
                ),
              },
            },
          );

          // Populate the webhooks_responses table
          await this.prisma.webhooks_reponses.create({
            data: {
              id_webhooks_reponse: uuidv4(),
              http_response_data: response.data,
              http_status_code: response.status.toString(),
            },
          });
          await this.prisma.webhook_delivery_attempts.update({
            where: {
              id_webhook_delivery_attempt:
                w_delivery.id_webhook_delivery_attempt,
            },
            data: {
              status: 'success',
            },
          });
        } catch (error) {
          // If the POST request fails, set a next retry time and reinsert the job in the queue
          const nextRetry = new Date();
          nextRetry.setSeconds(nextRetry.getSeconds() + 60); // Retry after 60 seconds

          await this.prisma.webhook_delivery_attempts.update({
            where: {
              id_webhook_delivery_attempt:
                w_delivery.id_webhook_delivery_attempt,
            },
            data: {
              status: 'failed',
              next_retry: nextRetry,
            },
          });

          //re-insert the webhook in the queue
          await this.handleFailedWebhook(
            w_delivery.id_webhook_delivery_attempt,
          );
        }
      }
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'DELIVERING_PRIORITY_WEBHOOK_ERROR',
          message: 'WebhookService.handlePriorityWebhook() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async handleFailedWebhook(failed_id_delivery_webhook: string) {
    try {
      await this.queue.add(
        {
          webhook_delivery_id: failed_id_delivery_webhook,
        },
        { delay: 60000 },
      );
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'DELIVERING_FAILED_WEBHOOK_ERROR',
          message: 'WebhookService.handleFailedWebhook() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async verifyPayloadSignature(
    payload: { [key: string]: any },
    signature: string,
    secret: string,
  ) {
    try {
      const expected = this.generateSignature(payload, secret);
      if (expected !== signature) {
        throw new WebhooksError({
          name: 'INVALID_SIGNATURE_ERROR',
          message: `Signature mismatch for the payload received with signature=${signature}`,
        });
      }
      return 200;
    } catch (error) {
      throwTypedError(
        new WebhooksError({
          name: 'VERIFY_PAYLOAD_ERROR',
          message: 'WebhookService.verifyPayloadSignature() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }
}
