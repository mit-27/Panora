import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCashflowStatementInput,
  UnifiedCashflowStatementOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCashflowStatementOutput } from '@@core/utils/types/original/original.accounting';

import { ICashflowStatementService } from '../types';

@Injectable()
export class CashflowStatementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CashflowStatementService.name);
  }

  async batchAddCashflowStatements(
    unifiedCashflowStatementData: UnifiedCashflowStatementInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowStatementOutput[]> {
    return;
  }

  async addCashflowStatement(
    unifiedCashflowStatementData: UnifiedCashflowStatementInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowStatementOutput> {
    return;
  }

  async getCashflowStatement(
    id_cashflowstatementing_cashflowstatement: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowStatementOutput> {
    return;
  }

  async getCashflowStatements(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowStatementOutput[]> {
    return;
  }
}
