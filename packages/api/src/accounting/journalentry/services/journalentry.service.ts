import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedJournalEntryInput,
  UnifiedJournalEntryOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalJournalEntryOutput } from '@@core/utils/types/original/original.accounting';

import { IJournalEntryService } from '../types';

@Injectable()
export class JournalEntryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(JournalEntryService.name);
  }

  async batchAddJournalEntrys(
    unifiedJournalEntryData: UnifiedJournalEntryInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalEntryOutput[]> {
    return;
  }

  async addJournalEntry(
    unifiedJournalEntryData: UnifiedJournalEntryInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalEntryOutput> {
    return;
  }

  async getJournalEntry(
    id_journalentrying_journalentry: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalEntryOutput> {
    return;
  }

  async getJournalEntrys(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalEntryOutput[]> {
    return;
  }
}
