import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTaxRateInput,
  UnifiedTaxRateOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTaxRateOutput } from '@@core/utils/types/original/original.accounting';

import { ITaxRateService } from '../types';

@Injectable()
export class TaxRateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TaxRateService.name);
  }

  async batchAddTaxRates(
    unifiedTaxRateData: UnifiedTaxRateInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxRateOutput[]> {
    return;
  }

  async addTaxRate(
    unifiedTaxRateData: UnifiedTaxRateInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxRateOutput> {
    return;
  }

  async getTaxRate(
    id_taxrateing_taxrate: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxRateOutput> {
    return;
  }

  async getTaxRates(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxRateOutput[]> {
    return;
  }
}
