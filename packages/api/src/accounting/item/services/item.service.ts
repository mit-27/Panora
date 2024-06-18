import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedItemInput, UnifiedItemOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalItemOutput } from '@@core/utils/types/original/original.accounting';

import { IItemService } from '../types';

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ItemService.name);
  }

  async batchAddItems(
    unifiedItemData: UnifiedItemInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedItemOutput[]> {
    return;
  }

  async addItem(
    unifiedItemData: UnifiedItemInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedItemOutput> {
    return;
  }

  async getItem(
    id_iteming_item: string,
    remote_data?: boolean,
  ): Promise<UnifiedItemOutput> {
    return;
  }

  async getItems(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedItemOutput[]> {
    return;
  }
}
