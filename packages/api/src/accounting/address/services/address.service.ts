import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedAddressInput,
  UnifiedAddressOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { IAddressService } from '../types';

@Injectable()
export class AddressService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AddressService.name);
  }

  async batchAddAddresss(
    unifiedAddressData: UnifiedAddressInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput[]> {
    return;
  }

  async addAddress(
    unifiedAddressData: UnifiedAddressInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput> {
    return;
  }

  async getAddress(
    id_addressing_address: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput> {
    return;
  }

  async getAddresss(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput[]> {
    return;
  }
}
