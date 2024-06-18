import { AffinityService } from './services/affinity';
import { Module } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { ContactController } from './contact.controller';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { AttioService } from './services/attio';
import { ZohoService } from './services/zoho';
import { PipedriveService } from './services/pipedrive';
import { HubspotService } from './services/hubspot';
import { LoggerService } from '@@core/logger/logger.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { SyncService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from './services/registry.service';
import { CloseService } from './services/close';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@crm/@lib/@utils';
import { ConnectionUtils } from '@@core/connections/@utils';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [ContactController],
  providers: [
    ContactService,

    LoggerService,
    FieldMappingService,
    SyncService,
    WebhookService,
    EncryptionService,
    ServiceRegistry,
    CoreUnification,
    UnificationRegistry,
    MappersRegistry,
    Utils,
    ConnectionUtils,
    /* PROVIDERS SERVICES */
    AttioService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
    AffinityService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class ContactModule {}
