import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { IAccountService } from '../types';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AccountService.name);
  }

  async batchAddAccounts(
    unifiedAccountData: UnifiedAccountInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountOutput[]> {
    return;
  }

  async addAccount(
    unifiedAccountData: UnifiedAccountInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountOutput> {
    return;
  }

  async getAccount(
    id_accounting_account: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountOutput> {
    return;
  }

  async getAccounts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountOutput[]> {
    return;
  }
}
