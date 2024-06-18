import { ZohoNoteInput, ZohoNoteOutput } from './types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZohoNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'zoho', this);
  }
  async desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZohoNoteInput> {
    const module = source.deal_id
      ? {
          api_name: 'Deals',
          id: await this.utils.getRemoteIdFromDealUuid(source.deal_id),
        }
      : source.company_id
      ? {
          api_name: 'Accounts',
          id: await this.utils.getRemoteIdFromCompanyUuid(source.company_id),
        }
      : source.contact_id
      ? {
          api_name: 'Contacts',
          id: await this.utils.getRemoteIdFromContactUuid(source.contact_id),
        }
      : { api_name: '', id: '' };

    const result: ZohoNoteInput = {
      Note_Content: source.content,
      Parent_Id: {
        module: {
          api_name: module.api_name,
          id: module.id,
        },
        id: '', // todo
      },
    };

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: ZohoNoteOutput | ZohoNoteOutput[],
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
    note: ZohoNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = note[mapping.remote_id];
      }
    }

    const res: UnifiedNoteOutput = {
      remote_id: note.id,
      content: note.Note_Content,
      field_mappings,
    };

    const module = note.Parent_Id.module;
    if (module.api_name === 'Deals' && module.id) {
      res.deal_id = await this.utils.getDealUuidFromRemoteId(module.id, 'zoho');
    }
    if (module.api_name === 'Accounts' && module.id) {
      res.company_id = await this.utils.getCompanyUuidFromRemoteId(
        module.id,
        'zoho',
      );
    }
    if (module.api_name === 'Contacts' && module.id) {
      res.contact_id = await this.utils.getContactUuidFromRemoteId(
        module.id,
        'zoho',
      );
    }

    return res;
  }
}
