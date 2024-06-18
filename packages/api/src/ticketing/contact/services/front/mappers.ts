import { IContactMapper } from '@ticketing/contact/types';
import { FrontContactInput, FrontContactOutput } from './types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class FrontContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'contact', 'front', this);
  }
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontContactInput {
    return;
  }

  unify(
    source: FrontContactOutput | FrontContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
    contact: FrontContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.custom_fields[mapping.remote_id];
      }
    }
    const emailHandle = contact.handles.find(
      (handle) => handle.source === 'email',
    );
    const phoneHandle = contact.handles.find(
      (handle) => handle.source === 'phone',
    );

    const unifiedContact: UnifiedContactOutput = {
      remote_id: contact.id,
      name: contact.name,
      email_address: emailHandle.handle || '',
      phone_number: phoneHandle.handle || '',
      field_mappings: field_mappings,
    };

    return unifiedContact;
  }
}
