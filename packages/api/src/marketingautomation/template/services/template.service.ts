import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTemplateInput,
  UnifiedTemplateOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { ITemplateService } from '../types';

@Injectable()
export class TemplateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TemplateService.name);
  }

  async batchAddTemplates(
    unifiedTemplateData: UnifiedTemplateInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput[]> {
    return;
  }

  async addTemplate(
    unifiedTemplateData: UnifiedTemplateInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput> {
    return;
  }

  async getTemplate(
    id_templateing_template: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput> {
    return;
  }

  async getTemplates(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput[]> {
    return;
  }
}
