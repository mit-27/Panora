import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisPayrollrunOutput } from '../types/model.unified';
import { IPayrollRunService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_payroll_runs as HrisPayrollRun } from '@prisma/client';
import { OriginalPayrollRunOutput } from '@@core/utils/types/original/original.hris';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('hris', 'payrollrun', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */12 * * *') // every 12 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing payroll runs...');
      const users = user_id
        ? [await this.prisma.users.findUnique({ where: { id_user: user_id } })]
        : await this.prisma.users.findMany();

      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: { id_user: user.id_user },
          });
          for (const project of projects) {
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: { id_project: project.id_project },
            });
            for (const linkedUser of linkedUsers) {
              for (const provider of HRIS_PROVIDERS) {
                await this.syncForLinkedUser({
                  integrationId: provider,
                  linkedUserId: linkedUser.id_linked_user,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IPayrollRunService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisPayrollrunOutput,
        OriginalPayrollRunOutput,
        IPayrollRunService
      >(integrationId, linkedUserId, 'hris', 'payrollrun', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    payrollRuns: UnifiedHrisPayrollrunOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisPayrollRun[]> {
    try {
      const payrollRunResults: HrisPayrollRun[] = [];

      for (let i = 0; i < payrollRuns.length; i++) {
        const payrollRun = payrollRuns[i];
        const originId = payrollRun.remote_id;

        let existingPayrollRun = await this.prisma.hris_payroll_runs.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const payrollRunData = {
          run_state: payrollRun.run_state,
          run_type: payrollRun.run_type,
          start_date: payrollRun.start_date
            ? new Date(payrollRun.start_date)
            : null,
          end_date: payrollRun.end_date ? new Date(payrollRun.end_date) : null,
          check_date: payrollRun.check_date
            ? new Date(payrollRun.check_date)
            : null,
          remote_id: originId,
          remote_created_at: payrollRun.remote_created_at
            ? new Date(payrollRun.remote_created_at)
            : new Date(),
          modified_at: new Date(),
          remote_was_deleted: payrollRun.remote_was_deleted || false,
        };

        if (existingPayrollRun) {
          existingPayrollRun = await this.prisma.hris_payroll_runs.update({
            where: {
              id_hris_payroll_run: existingPayrollRun.id_hris_payroll_run,
            },
            data: payrollRunData,
          });
        } else {
          existingPayrollRun = await this.prisma.hris_payroll_runs.create({
            data: {
              ...payrollRunData,
              id_hris_payroll_run: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        payrollRunResults.push(existingPayrollRun);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          payrollRun.field_mappings,
          existingPayrollRun.id_hris_payroll_run,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingPayrollRun.id_hris_payroll_run,
          remote_data[i],
        );
      }

      return payrollRunResults;
    } catch (error) {
      throw error;
    }
  }
}
