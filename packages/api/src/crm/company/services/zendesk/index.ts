import { Injectable } from '@nestjs/common';
import { ICompanyService } from '@crm/company/types';
import { CrmObject } from '@crm/@utils/@types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { ZendeskCompanyInput, ZendeskCompanyOutput } from './types';
@Injectable()
export class ZendeskService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addCompany(
    companyData: ZendeskCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskCompanyOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/contacts`,
        {
          data: companyData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: resp.data.data,
        message: 'Zendesk company created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.company,
        ActionType.POST,
      );
    }
    return;
  }

  async syncCompanies(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskCompanyOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`${connection.account_url}/contacts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items
        .filter((item) => item.data.is_organization === true)
        .map((item) => {
          return item.data;
        });
      this.logger.log(`Synced zendesk companies !`);

      return {
        data: finalData,
        message: 'Zendesk companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.company,
        ActionType.GET,
      );
    }
  }
}
