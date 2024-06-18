import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedRejectReasonInput,
  UnifiedRejectReasonOutput,
} from './model.unified';
import { OriginalRejectReasonOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IRejectReasonService {
  addRejectReason(
    rejectreasonData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalRejectReasonOutput>>;

  syncRejectReasons(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalRejectReasonOutput[]>>;
}

export interface IRejectReasonMapper {
  desunify(
    source: UnifiedRejectReasonInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalRejectReasonOutput | OriginalRejectReasonOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedRejectReasonOutput | UnifiedRejectReasonOutput[];
}
