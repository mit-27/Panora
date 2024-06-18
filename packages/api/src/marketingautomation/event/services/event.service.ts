import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedEventInput, UnifiedEventOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { IEventService } from '../types';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EventService.name);
  }

  async batchAddEvents(
    unifiedEventData: UnifiedEventInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput[]> {
    return;
  }

  async addEvent(
    unifiedEventData: UnifiedEventInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput> {
    return;
  }

  async getEvent(
    id_eventing_event: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput> {
    return;
  }

  async getEvents(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput[]> {
    return;
  }
}
