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
import { IScoreCardService } from '../types';
import { OriginalScoreCardOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedAtsScorecardOutput } from '../types/model.unified';
import { ats_scorecards as AtsScoreCard } from '@prisma/client';
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
    this.registry.registerService('ats', 'scorecard', this);
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
      const service: IScoreCardService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ats, commonObject: scorecard} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedAtsScorecardOutput,
        OriginalScoreCardOutput,
        IScoreCardService
      >(integrationId, linkedUserId, 'ats', 'scorecard', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    scoreCards: UnifiedAtsScorecardOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsScoreCard[]> {
    try {
      const scoreCards_results: AtsScoreCard[] = [];

      const updateOrCreateScoreCard = async (
        scoreCard: UnifiedAtsScorecardOutput,
        originId: string,
      ) => {
        let existingScoreCard;
        if (!originId) {
          existingScoreCard = await this.prisma.ats_scorecards.findFirst({
            where: {
              overall_recommendation: scoreCard.overall_recommendation,
              id_ats_application: scoreCard.application_id,
            },
          });
        } else {
          existingScoreCard = await this.prisma.ats_scorecards.findFirst({
            where: {
              remote_id: originId,
            },
          });
        }

        const baseData: any = {
          overall_recommendation: scoreCard.overall_recommendation ?? null,
          application_id: scoreCard.application_id ?? null,
          interview_id: scoreCard.interview_id ?? null,
          remote_created_at: scoreCard.remote_created_at ?? null,
          submitted_at: scoreCard.submitted_at ?? null,
          modified_at: new Date(),
        };

        if (existingScoreCard) {
          return await this.prisma.ats_scorecards.update({
            where: {
              id_ats_scorecard: existingScoreCard.id_ats_scorecard,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_scorecards.create({
            data: {
              ...baseData,
              id_ats_scorecard: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
            },
          });
        }
      };

      for (let i = 0; i < scoreCards.length; i++) {
        const scoreCard = scoreCards[i];
        const originId = scoreCard.remote_id;

        const res = await updateOrCreateScoreCard(scoreCard, originId);
        const score_card_id = res.id_ats_scorecard;
        scoreCards_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          scoreCard.field_mappings,
          score_card_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          score_card_id,
          remote_data[i],
        );
      }
      return scoreCards_results;
    } catch (error) {
      throw error;
    }
  }
}
