import { ZohoCompanyInput, ZohoCompanyOutput } from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';

export class ZohoCompanyMapper implements ICompanyMapper {
  desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoCompanyInput {
    const result: ZohoCompanyInput = {
      Account_Name: source.name,
      Phone: source.phone_numbers?.find(
        (phone) => phone.phone_type === 'primary',
      )?.phone_number,
      Email: source.email_addresses?.find(
        (email) => email.email_address_type === 'primary',
      )?.email_address,
      Mailing_Street: source.addresses?.[0]?.street_1,
      Mailing_City: source.addresses?.[0]?.city,
      Mailing_State: source.addresses?.[0]?.state,
      Mailing_Zip: source.addresses?.[0]?.postal_code,
      Mailing_Country: source.addresses?.[0]?.country,
    };

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
    source: ZohoCompanyOutput | ZohoCompanyOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(source, customFieldMappings);
    }

    return source.map((company) =>
      this.mapSingleCompanyToUnified(company, customFieldMappings),
    );
  }

  private mapSingleCompanyToUnified(
    company: ZohoCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCompanyOutput {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: company[mapping.remote_id],
      })) || [];

    return {
      remote_id: company.id,
      name: company.Account_Name,
      phone_numbers: [
        {
          phone_number: company.Phone,
          phone_type: 'primary',
          owner_type: 'company',
        },
      ],
      email_addresses: [
        {
          email_address: company.Email,
          email_address_type: 'primary',
          owner_type: 'company',
        },
      ],
      addresses: [
        {
          street_1: company.Mailing_Street,
          city: company.Mailing_City,
          state: company.Mailing_State,
          postal_code: company.Mailing_Zip,
          country: company.Mailing_Country,
          address_type: 'primary',
          owner_type: 'company',
        },
      ],
      industry: '', //TODO
      number_of_employees: 0, //TODO
      field_mappings,
    };
  }
}
