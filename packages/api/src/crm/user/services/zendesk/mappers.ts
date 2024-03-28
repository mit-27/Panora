import { ZendeskUserInput, ZendeskUserOutput } from '@crm/@utils/@types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';

export class ZendeskUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskUserInput {
    const result: ZendeskUserInput = {
      name: source.name,
      email: source.email,
    };

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

  unify(
    source: ZendeskUserOutput | ZendeskUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(source, customFieldMappings);
    }

    // Handling array of ZendeskUserOutput
    return source.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: ZendeskUserOutput,
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
      remote_id: user.id + "",
      name: user.name,
      email: user.email,
      field_mappings,
    };
  }
}
