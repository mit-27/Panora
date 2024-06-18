import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import {
  CloseContactInput,
  CloseContactOutput,
  InputPhone,
  InputEmail,
} from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloseContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'close', this);
  }

  async desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseContactInput> {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const result: CloseContactInput = {
      name: `${source.first_name ?? ''} ${source.last_name ?? ''}`,
      phones: source?.phone_numbers?.map(
        ({ phone_number, phone_type }) =>
          ({
            phone: phone_number,
            type: phone_type,
          } as InputPhone),
      ),
      emails: source?.email_addresses?.map(
        ({ email_address, email_address_type }) =>
          ({
            email: email_address,
            type: email_address_type,
          } as InputEmail),
      ),
    };

    result.lead_id = source?.field_mappings?.['company_id'];

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
    source: CloseContactOutput | CloseContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput | UnifiedContactOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleContactToUnified(source, customFieldMappings);
    }
    // Handling array of CloseContactOutput
    return source.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
    contact: CloseContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact[mapping.remote_id];
      }
    }

    return {
      remote_id: contact.id,
      first_name: contact.name,
      last_name: '',
      email_addresses: contact.emails?.map(({ email, type }) => ({
        email_address: email,
        email_address_type: type,
        owner_type: 'contact',
      })),
      phone_numbers: contact.phones?.map(({ phone, type }) => ({
        phone_number: phone,
        phone_type: type,
        owner_type: 'contact',
      })),
      field_mappings,
      addresses: [],
    };
  }
}
