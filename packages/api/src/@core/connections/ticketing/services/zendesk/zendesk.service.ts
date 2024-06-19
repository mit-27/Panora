import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import {
  Action,
  ActionType,
  ConnectionsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ITicketingConnectionService } from '../../types';
import { ServiceRegistry } from '../registry.service';
import {
  AuthStrategy,
  CONNECTORS_METADATA,
  DynamicApiUrl,
} from '@panora/shared';
import { OAuth2AuthData, providerToType } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { OAuthCallbackParams } from '@@core/connections/@utils/types';
import { ManagedWebhooksService } from '@@core/managed-webhooks/managed-webhooks.service';

export interface ZendeskOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}
@Injectable()
export class ZendeskConnectionService implements ITicketingConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,
    private mwService: ManagedWebhooksService,
  ) {
    this.logger.setContext(ZendeskConnectionService.name);
    this.registry.registerService('zendesk', this);
    this.type = providerToType('zendesk', 'ticketing', AuthStrategy.oauth2);
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });

      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        scope: 'read',
      });

      this.logger.log('Data Form is ' + JSON.stringify(formData));

      const res = await axios.post(
        `https://${CREDENTIALS.SUBDOMAIN}.zendesk.com/oauth/tokens`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ZendeskOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : zendesk ticketing ' + JSON.stringify(data),
      );

      let db_res;
      const connection_token = uuidv4();
      const BASE_API_URL = (
        CONNECTORS_METADATA['ticketing']['zendesk'].urls.apiUrl as DynamicApiUrl
      )(CREDENTIALS.SUBDOMAIN);

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            account_url: BASE_API_URL,
            refresh_token: '',
            expiration_timestamp: new Date(), //TODO
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'zendesk',
            vertical: 'ticketing',
            token_type: 'oauth',
            account_url: BASE_API_URL,
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: '',
            expiration_timestamp: new Date(), //TODO
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: {
                id_linked_user: await this.connectionUtils.getLinkedUserId(
                  projectId,
                  linkedUserId,
                ),
              },
            },
          },
        });
      }
      // upsert the creation of a managed webhook + 3rdpartywebhook
      if (
        CONNECTORS_METADATA['ticketing']['zendesk'].realTimeWebhookMetadata
          .method == 'API'
      ) {
        const scopes =
          CONNECTORS_METADATA['ticketing']['zendesk'].realTimeWebhookMetadata
            .events;
        const exclude: string[] = [
          'ticketing.tickets.events',
          'ticketing.comments.events',
          'ticketing.tags.events',
          'ticketing.attachments.events',
        ];

        // Filter the array to exclude specified elements
        const filteredEvents = scopes.filter(
          (event) => !exclude.includes(event),
        );

        const basic_mw = await this.mwService.createManagedWebhook({
          id_connection: db_res.id_connection,
          scopes: filteredEvents,
        });
        const trigger_mw = await this.mwService.createManagedWebhook({
          id_connection: db_res.id_connection,
          scopes: exclude,
        });
        await this.mwService.createRemoteThirdPartyWebhook({
          id_connection: db_res.id_connection,
          mw_ids: [basic_mw.id_managed_webhook, trigger_mw.id_managed_webhook],
          data: {
            name_basic: 'Panora Webhook Events',
            name_trigger: 'Panora Tickets Related Events Webhook',
          },
        });
      }
      return db_res;
    } catch (error) {
      throwTypedError(
        new ConnectionsError({
          name: 'HANDLE_OAUTH_CALLBACK_TICKETING',
          message: `ZendeskConnectionService.handleCallback() call failed ---> ${format3rdPartyError(
            'zendesk',
            Action.oauthCallback,
            ActionType.POST,
          )}`,
          cause: error,
        }),
        this.logger,
      );
    }
  }
}
