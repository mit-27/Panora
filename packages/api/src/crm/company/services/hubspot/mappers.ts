import { HubspotCompanyInput, HubspotCompanyOutput } from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/deal/utils';

export class HubspotCompanyMapper implements ICompanyMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }
  async desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotCompanyInput> {
    const result: HubspotCompanyInput = {
      city: '',
      name: source.name,
      phone: '',
      state: '',
      domain: '',
      industry: source.industry,
    };

    // Assuming 'phone_numbers' array contains at least one phone number
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;
    if (primaryPhone) {
      result.phone = primaryPhone;
    }
    if (source.addresses) {
      const address = source.addresses[0];
      if (address) {
        result.city = address.city;
        result.state = address.state;
      }
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result[mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }

    return result;
  }

  async unify(
    source: HubspotCompanyOutput | HubspotCompanyOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotCompanyOutput
    return Promise.all(
      source.map((company) =>
        this.mapSingleCompanyToUnified(company, customFieldMappings),
      ),
    );
  }

  private async mapSingleCompanyToUnified(
    company: HubspotCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: company.properties[mapping.remote_id],
      })) || [];

    let opts: any = {};
    //TODO - Logic needs to be reconsider
    if (company.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        company.properties.hubspot_owner_id,
        'hubspot',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      remote_id: company.id,
      name: company.properties.name,
      industry: company.properties.industry,
      number_of_employees: 0, // Placeholder, as there's no direct mapping provided
      addresses: [
        {
          street_1: '',
          city: company.properties.city,
          state: company.properties.state,
          postal_code: '',
          country: '',
          address_type: 'primary',
          owner_type: 'company',
        },
      ], // Assuming 'street', 'city', 'state', 'postal_code', 'country' are properties in company.properties
      phone_numbers: [
        {
          phone_number: company.properties.phone,
          phone_type: 'primary',
          owner_type: 'company',
        },
      ],
      field_mappings,
      ...opts,
    };
  }
}
