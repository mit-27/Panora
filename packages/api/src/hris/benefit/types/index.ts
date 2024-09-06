import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisBenefitInput,
  UnifiedHrisBenefitOutput,
} from './model.unified';
import { OriginalBenefitOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IBenefitService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalBenefitOutput[]>>;
}

export interface IBenefitMapper {
  desunify(
    source: UnifiedHrisBenefitInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalBenefitOutput | OriginalBenefitOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisBenefitOutput | UnifiedHrisBenefitOutput[]>;
}
