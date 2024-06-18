import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedInvoiceInput,
  UnifiedInvoiceOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalInvoiceOutput } from '@@core/utils/types/original/original.accounting';

import { IInvoiceService } from '../types';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(InvoiceService.name);
  }

  async batchAddInvoices(
    unifiedInvoiceData: UnifiedInvoiceInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput[]> {
    return;
  }

  async addInvoice(
    unifiedInvoiceData: UnifiedInvoiceInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput> {
    return;
  }

  async getInvoice(
    id_invoiceing_invoice: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput> {
    return;
  }

  async getInvoices(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput[]> {
    return;
  }
}
