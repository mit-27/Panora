import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import {
  HubspotDealInput,
  HubspotDealOutput,
  commonDealHubspotProperties,
} from './types';
@Injectable()
export class HubspotService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addDeal(
    dealData: HubspotDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotDealOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      const dataBody = {
        properties: dealData,
      };
      const resp = await axios.post(
        `${connection.account_url}/objects/deals`,
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
      return {
        data: resp.data,
        message: 'Hubspot deal created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.deal,
        ActionType.POST,
      );
    }
  }

  async syncDeals(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotDealOutput[]>> {
    try {
      //crm.schemas.deals.read","crm.objects.deals.read
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonDealHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = `${connection.account_url}/objects/deals`;

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
      this.logger.log(`Synced hubspot deals !`);

      return {
        data: resp.data.results,
        message: 'Hubspot deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.deal,
        ActionType.GET,
      );
    }
  }
}
