import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from './model.unified';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface ISharedLinkService {
  addSharedlink(
    sharedlinkData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalSharedLinkOutput>>;

  syncSharedlinks(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalSharedLinkOutput[]>>;
}

export interface ISharedLinkMapper {
  desunify(
    source: UnifiedSharedLinkInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalSharedLinkOutput | OriginalSharedLinkOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedSharedLinkOutput | UnifiedSharedLinkOutput[];
}
