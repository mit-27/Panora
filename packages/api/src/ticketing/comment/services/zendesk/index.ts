import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../registry.service';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import { EnvironmentService } from '@@core/environment/environment.service';
@Injectable()
export class ZendeskService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addComment(
    commentData: ZendeskCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<ZendeskCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });

      const author_id = commentData.author_id;

      let dataBody: any = {
        ticket: {
          comment: {
            ...commentData,
            author_id: author_id,
          },
        },
      };
      // We must fetch tokens from zendesk with the commentData.uploads array of Attachment uuids
      const uuids = commentData.uploads;
      let uploads = [];
      if (uuids && uuids.length > 0) {
        await Promise.all(
          uuids.map(async (uuid) => {
            const res = await this.prisma.tcg_attachments.findUnique({
              where: {
                id_tcg_attachment: uuid,
              },
            });
            if (!res)
              throw new ReferenceError(
                `tcg_attachment not found for uuid ${uuid}`,
              );

            //TODO:; fetch the right file from AWS s3
            const s3File = '';
            const url = `${connection.account_url}/uploads.json?filename=${res.file_name}`;

            const resp = await axios.get(url, {
              headers: {
                'Content-Type': 'image/png', //TODO: get the right content-type given a file name extension
                Authorization: `Bearer ${this.cryptoService.decrypt(
                  connection.access_token,
                )}`,
              },
            });
            uploads = [...uploads, resp.data.upload.token];
          }),
        );
        const finalData = {
          ticket: {
            comment: {
              ...commentData,
              uploads: uploads,
            },
          },
        };
        dataBody = finalData;
      }

      //to add a comment on Zendesk you must update a ticket using the Ticket API
      const resp = await axios.put(
        `${connection.account_url}/tickets/${remoteIdTicket}.json`,
        JSON.stringify(dataBody),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const pre_res = resp.data.audit.events.find((obj) =>
        obj.hasOwnProperty('body'),
      );
      return {
        data: pre_res,
        message: 'Zendesk comment created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'zendesk',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<OriginalCommentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });
      //retrieve ticket remote id so we can retrieve the comments in the original software
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/tickets/${ticket.remote_id}/comments.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zendesk comments !`);

      return {
        data: resp.data.comments,
        message: 'Zendesk comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'zendesk',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}
