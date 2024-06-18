import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { IAccountService } from '@ticketing/account/types';
import { ZendeskAccountOutput } from './types';

@Injectable()
export class ZendeskService implements IAccountService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.account.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async syncAccounts(
    linkedUserId: string,
    remote_account_id?: string,
  ): Promise<ApiResponse<ZendeskAccountOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });
      const request_url = remote_account_id
        ? `${connection.account_url}/organizations/${remote_account_id}.json`
        : `${connection.account_url}/organizations.json`;
      const resp = await axios.get(request_url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced zendesk accounts !`);

      const result = remote_account_id
        ? [resp.data.organization]
        : resp.data.organizations;

      return {
        data: result,
        message: 'Zendesk accounts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'zendesk',
        TicketingObject.account,
        ActionType.GET,
      );
    }
  }
}
