import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IJobInterviewStageService } from '../types';
import { OriginalJobInterviewStageOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedAtsJobinterviewstageOutput } from '../types/model.unified';
import { ats_job_interview_stages as AtsJobInterviewStage } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ats', 'jobinterviewstage', this);
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
      const service: IJobInterviewStageService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ats, commonObject: jobinterviewstage} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedAtsJobinterviewstageOutput,
        OriginalJobInterviewStageOutput,
        IJobInterviewStageService
      >(integrationId, linkedUserId, 'ats', 'jobinterviewstage', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    jobInterviewStages: UnifiedAtsJobinterviewstageOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsJobInterviewStage[]> {
    try {
      const jobInterviewStages_results: AtsJobInterviewStage[] = [];

      const updateOrCreateJobInterviewStage = async (
        jobInterviewStage: UnifiedAtsJobinterviewstageOutput,
        originId: string,
      ) => {
        const existingJobInterviewStage =
          await this.prisma.ats_job_interview_stages.findFirst({
            where: {
              remote_id: originId,
            },
          });

        const baseData: any = {
          name: jobInterviewStage.name ?? null,
          stage_order: jobInterviewStage.stage_order ?? null,
          job_id: jobInterviewStage.job_id ?? null,
          modified_at: new Date(),
        };

        if (existingJobInterviewStage) {
          return await this.prisma.ats_job_interview_stages.update({
            where: {
              id_ats_job_interview_stage:
                existingJobInterviewStage.id_ats_job_interview_stage,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_job_interview_stages.create({
            data: {
              ...baseData,
              id_ats_job_interview_stage: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
            },
          });
        }
      };

      for (let i = 0; i < jobInterviewStages.length; i++) {
        const jobInterviewStage = jobInterviewStages[i];
        const originId = jobInterviewStage.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateJobInterviewStage(
          jobInterviewStage,
          originId,
        );
        const job_interview_stage_id = res.id_ats_job_interview_stage;
        jobInterviewStages_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          jobInterviewStage.field_mappings,
          job_interview_stage_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          job_interview_stage_id,
          remote_data[i],
        );
      }

      return jobInterviewStages_results;
    } catch (error) {
      throw error;
    }
  }
}
