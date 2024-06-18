import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedPhoneNumberInput,
  UnifiedPhoneNumberOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPhoneNumberOutput } from '@@core/utils/types/original/original.accounting';

import { IPhoneNumberService } from '../types';

@Injectable()
export class PhoneNumberService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PhoneNumberService.name);
  }

  async batchAddPhoneNumbers(
    unifiedPhoneNumberData: UnifiedPhoneNumberInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhoneNumberOutput[]> {
    return;
  }

  async addPhoneNumber(
    unifiedPhoneNumberData: UnifiedPhoneNumberInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhoneNumberOutput> {
    return;
  }

  async getPhoneNumber(
    id_phonenumbering_phonenumber: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhoneNumberOutput> {
    return;
  }

  async getPhoneNumbers(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhoneNumberOutput[]> {
    return;
  }
}
