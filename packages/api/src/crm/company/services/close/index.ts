import { Injectable } from '@nestjs/common';
import { ICompanyService } from '@crm/company/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import {
  commonCompanyCloseProperties,
  CloseCompanyInput,
  CloseCompanyOutput,
} from './types';

@Injectable()
export class CloseService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }
  async addCompany(
    companyData: CloseCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseCompanyOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/lead`,
        JSON.stringify(companyData),
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
        data: resp?.data,
        message: 'Close company created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.company,
        ActionType.POST,
      );
    }
  }

  async syncCompanies(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<CloseCompanyOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonCompanyCloseProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = `${connection.account_url}/lead/`;
      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close companies!`);

      return {
        data: resp?.data?.data,
        message: 'Close companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.company,
        ActionType.GET,
      );
    }
  }
}
