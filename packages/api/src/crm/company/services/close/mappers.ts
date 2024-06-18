import { CloseCompanyInput, CloseCompanyOutput } from './types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';

@Injectable()
export class CloseCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'close', this);
  }

  async desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseCompanyInput> {
    const result: CloseCompanyInput = {
      name: source?.name,
      addresses: source?.addresses?.map((address) => ({
        address_1: address.street_1,
        address_2: address.street_2,
        city: address.city,
        state: address.state,
        zipcode: address.postal_code,
        label: address.address_type,
      })) as CloseCompanyInput['addresses'],
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
    source: CloseCompanyOutput | CloseCompanyOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(source, customFieldMappings);
    }
    // Handling array of CloseCompanyOutput
    return Promise.all(
      source.map((company) =>
        this.mapSingleCompanyToUnified(company, customFieldMappings),
      ),
    );
  }

  private async mapSingleCompanyToUnified(
    company: CloseCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company[mapping.remote_id];
      }
    }
    let opts: any = {};
    if (company?.created_by || company?.custom?.close_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        (company?.created_by || company?.custom?.close_owner_id) as string,
        'close',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    return {
      remote_id: company.id,
      name: company.name,
      industry: company?.custom?.Industry || '',
      number_of_employees: company?.custom?.employees || 0, // Placeholder, as there's no direct mapping provided
      addresses: company?.addresses?.map((address) => ({
        street_1: address.address_1,
        street_2: address.address_2,
        city: address.city,
        state: address.state,
        postal_code: address.zipcode,
        country: address.country,
        address_type: address.label,
        owner_type: 'company',
      })), // Assuming 'street', 'city', 'state', 'postal_code', 'country' are properties in company.properties
      phone_numbers: [],
      field_mappings,
      ...opts,
    };
  }
}
