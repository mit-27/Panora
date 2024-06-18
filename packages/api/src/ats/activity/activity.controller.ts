import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import {
  UnifiedActivityInput,
  UnifiedActivityOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ActivityService } from './services/activity.service';

@ApiTags('ats/activity')
@Controller('ats/activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(ActivityController.name);
  }

  @ApiOperation({
    operationId: 'getActivitys',
    summary: 'List a batch of Activitys',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedActivityOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getActivitys(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.activityService.getActivitys(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getActivity',
    summary: 'Retrieve a Activity',
    description: 'Retrieve a activity from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the activity you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedActivityOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getActivity(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.activityService.getActivity(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addActivity',
    summary: 'Create a Activity',
    description: 'Create a activity in any supported Ats software',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiBody({ type: UnifiedActivityInput })
  @ApiCustomResponse(UnifiedActivityOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addActivity(
    @Body() unifiedActivityData: UnifiedActivityInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.activityService.addActivity(
        unifiedActivityData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addActivitys',
    summary: 'Add a batch of Activitys',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiBody({ type: UnifiedActivityInput, isArray: true })
  @ApiCustomResponse(UnifiedActivityOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addActivitys(
    @Body() unfiedActivityData: UnifiedActivityInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.activityService.batchAddActivitys(
        unfiedActivityData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
