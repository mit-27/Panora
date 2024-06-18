import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { GorgiasCommentInput, GorgiasCommentOutput } from './types';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { TicketingObject } from '@ticketing/@lib/@types';

import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class GorgiasCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnification: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'gorgias',
      this,
    );
  }

  async desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GorgiasCommentInput> {
    const result: GorgiasCommentInput = {
      sender: {
        id:
          Number(await this.utils.getUserRemoteIdFromUuid(source.user_id)) ||
          Number(
            await this.utils.getContactRemoteIdFromUuid(
              source.user_id || source.contact_id,
            ),
          ),
      },
      via: 'chat',
      from_agent: false,
      channel: 'chat',
      body_html: source.html_body,
      body_text: source.body,
      attachments: source.attachments,
    };
    return result;
  }

  async unify(
    source: GorgiasCommentOutput | GorgiasCommentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleCommentToUnified(source, customFieldMappings);
    }
    return Promise.all(
      source.map((comment) =>
        this.mapSingleCommentToUnified(comment, customFieldMappings),
      ),
    );
  }

  private async mapSingleCommentToUnified(
    comment: GorgiasCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput> {
    let opts;

    if (comment.attachments && comment.attachments.length > 0) {
      const unifiedObject = (await this.coreUnification.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: comment.attachments,
        targetType: TicketingObject.attachment,
        providerName: 'gorgias',
        vertical: 'ticketing',
        customFieldMappings: [],
      })) as UnifiedAttachmentOutput[];

      opts = { ...opts, attachments: unifiedObject };
    }

    if (comment.sender.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.sender.id),
        'gorgias',
      );

      if (user_id) {
        opts = { user_id: user_id, creator_type: 'user' };
      } else {
        const contact_id = await this.utils.getContactUuidFromRemoteId(
          String(comment.sender.id),
          'gorgias',
        );
        if (contact_id) {
          opts = { creator_type: 'CONTACT', contact_id: contact_id };
        }
      }
    }

    const res = {
      body: comment.body_text || '',
      html_body: comment.body_html || '',
      ...opts,
    };

    return {
      remote_id: String(comment.id),
      ...res,
    };
  }
}
