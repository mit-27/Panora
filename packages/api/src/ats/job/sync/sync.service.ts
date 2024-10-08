import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalJobOutput } from '@@core/utils/types/original/original.ats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS } from '@panora/shared';
import { ats_jobs as AtsJob } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IJobService } from '../types';
import { UnifiedAtsJobOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ats', 'job', this);
  }
  onModuleInit() {
//
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = ATS_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IJobService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ats, commonObject: job} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedAtsJobOutput,
        OriginalJobOutput,
        IJobService
      >(integrationId, linkedUserId, 'ats', 'job', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    jobs: UnifiedAtsJobOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsJob[]> {
    try {
      const jobs_results: AtsJob[] = [];

      const updateOrCreateJob = async (
        job: UnifiedAtsJobOutput,
        originId: string,
      ) => {
        const existingJob = await this.prisma.ats_jobs.findFirst({
          where: {
            remote_id: originId,
          },
        });

        const baseData: any = {
          name: job.name ?? null,
          description: job.description ?? null,
          code: job.code ?? null,
          status: job.status ?? null,
          type: job.type ?? null,
          confidential: job.confidential ?? null,
          ats_departments: job.departments ?? null,
          ats_offices: job.offices ?? null,
          managers: job.managers ?? null,
          recruiters: job.recruiters ?? null,
          remote_created_at: job.remote_created_at ?? null,
          remote_updated_at: job.remote_updated_at ?? null,
          modified_at: new Date(),
        };

        if (existingJob) {
          return await this.prisma.ats_jobs.update({
            where: {
              id_ats_job: existingJob.id_ats_job,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_jobs.create({
            data: {
              ...baseData,
              id_ats_job: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
            },
          });
        }
      };

      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const originId = job.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateJob(job, originId);
        const job_id = res.id_ats_job;
        jobs_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          job.field_mappings,
          job_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(job_id, remote_data[i]);
      }

      return jobs_results;
    } catch (error) {
      throw error;
    }
  }
}
