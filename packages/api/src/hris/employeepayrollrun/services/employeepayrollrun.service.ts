import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedEmployeePayrollRunInput,
  UnifiedEmployeePayrollRunOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEmployeePayrollRunOutput } from '@@core/utils/types/original/original.hris';

import { IEmployeePayrollRunService } from '../types';

@Injectable()
export class EmployeePayrollRunService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployeePayrollRunService.name);
  }

  async batchAddEmployeePayrollRuns(
    unifiedEmployeePayrollRunData: UnifiedEmployeePayrollRunInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeePayrollRunOutput[]> {
    return;
  }

  async addEmployeePayrollRun(
    unifiedEmployeePayrollRunData: UnifiedEmployeePayrollRunInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeePayrollRunOutput> {
    return;
  }

  async getEmployeePayrollRun(
    id_employeepayrollruning_employeepayrollrun: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeePayrollRunOutput> {
    return;
  }

  async getEmployeePayrollRuns(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeePayrollRunOutput[]> {
    return;
  }
}
