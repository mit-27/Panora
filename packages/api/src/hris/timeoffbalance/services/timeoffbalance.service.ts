import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTimeoffBalanceInput,
  UnifiedTimeoffBalanceOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTimeoffBalanceOutput } from '@@core/utils/types/original/original.hris';

import { ITimeoffBalanceService } from '../types';

@Injectable()
export class TimeoffBalanceService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimeoffBalanceService.name);
  }

  async batchAddTimeoffBalances(
    unifiedTimeoffBalanceData: UnifiedTimeoffBalanceInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTimeoffBalanceOutput[]> {
    return;
  }

  async addTimeoffBalance(
    unifiedTimeoffBalanceData: UnifiedTimeoffBalanceInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTimeoffBalanceOutput> {
    return;
  }

  async getTimeoffBalance(
    id_timeoffbalanceing_timeoffbalance: string,
    remote_data?: boolean,
  ): Promise<UnifiedTimeoffBalanceOutput> {
    return;
  }

  async getTimeoffBalances(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTimeoffBalanceOutput[]> {
    return;
  }
}
