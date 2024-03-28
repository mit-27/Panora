import { HubspotUserInput, HubspotUserOutput } from '@crm/@utils/@types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';

export class HubspotUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotUserInput {
    return;
  }

  unify(
    source: HubspotUserOutput | HubspotUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotUserOutput
    return source.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: HubspotUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: user[mapping.remote_id],
      })) || [];

    return {
      remote_id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      field_mappings,
    };
  }
}
