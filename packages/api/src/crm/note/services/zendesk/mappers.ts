import { ZendeskNoteInput, ZendeskNoteOutput } from '@crm/@utils/@types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/note/utils';

export class ZendeskNoteMapper implements INoteMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }
  async desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskNoteInput> {
    const result: ZendeskNoteInput = {
      content: source.content,
    };
    if (source.contact_id) {
      //then the resource mut be contact and nothign else
      const contact_id = await this.utils.getRemoteIdFromContactUuid(
        source.contact_id,
      );
      if (contact_id) {
        result.resource_id = Number(contact_id);
        result.resource_type = 'contact';
      }
    } else {
      if (source.deal_id) {
        const deal_id = await this.utils.getRemoteIdFromDealUuid(
          source.deal_id,
        );
        if (deal_id) {
          result.resource_id = Number(deal_id);
          result.resource_type = 'deal';
        }
      }
    }

    // Custom field mappings
    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  async unify(
    source: ZendeskNoteOutput | ZendeskNoteOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleNoteToUnified(source, customFieldMappings);
    }

    return Promise.all(
      source.map((note) =>
        this.mapSingleNoteToUnified(note, customFieldMappings),
      ),
    );
  }

  private async mapSingleNoteToUnified(
    note: ZendeskNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: note[mapping.remote_id],
      })) || [];

    let opts: any = {};
    const type = note.resource_type;

    if (type == 'contact') {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        String(note.resource_id),
        'zendesk',
      );
      if (contact_id) {
        opts = {
          contact_id: contact_id,
        };
      }
    }

    if (type == 'deal') {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(note.resource_id),
        'zendesk',
      );
      if (deal_id) {
        opts = {
          deal_id: deal_id,
        };
      }
    }

    return {
      remote_id: note.id,
      content: note.content,
      field_mappings,
      ...opts,
    };
  }
}
