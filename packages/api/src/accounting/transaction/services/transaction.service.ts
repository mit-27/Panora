import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTransactionInput,
  UnifiedTransactionOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTransactionOutput } from '@@core/utils/types/original/original.accounting';

import { ITransactionService } from '../types';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  async batchAddTransactions(
    unifiedTransactionData: UnifiedTransactionInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTransactionOutput[]> {
    return;
  }

  async addTransaction(
    unifiedTransactionData: UnifiedTransactionInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTransactionOutput> {
    return;
  }

  async getTransaction(
    id_transactioning_transaction: string,
    remote_data?: boolean,
  ): Promise<UnifiedTransactionOutput> {
    return;
  }

  async getTransactions(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTransactionOutput[]> {
    return;
  }
}
