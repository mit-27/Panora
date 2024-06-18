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
import { TimeoffService } from './services/timeoff.service';
import {
  UnifiedTimeoffInput,
  UnifiedTimeoffOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('hris/timeoff')
@Controller('hris/timeoff')
export class TimeoffController {
  constructor(
    private readonly timeoffService: TimeoffService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TimeoffController.name);
  }

  @ApiOperation({
    operationId: 'getTimeoffs',
    summary: 'List a batch of Timeoffs',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedTimeoffOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTimeoffs(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.timeoffService.getTimeoffs(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTimeoff',
    summary: 'Retrieve a Timeoff',
    description: 'Retrieve a timeoff from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the timeoff you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedTimeoffOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTimeoff(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.timeoffService.getTimeoff(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTimeoff',
    summary: 'Create a Timeoff',
    description: 'Create a timeoff in any supported Hris software',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiBody({ type: UnifiedTimeoffInput })
  @ApiCustomResponse(UnifiedTimeoffOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTimeoff(
    @Body() unifiedTimeoffData: UnifiedTimeoffInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.timeoffService.addTimeoff(
        unifiedTimeoffData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addTimeoffs',
    summary: 'Add a batch of Timeoffs',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiBody({ type: UnifiedTimeoffInput, isArray: true })
  @ApiCustomResponse(UnifiedTimeoffOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addTimeoffs(
    @Body() unfiedTimeoffData: UnifiedTimeoffInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.timeoffService.batchAddTimeoffs(
        unfiedTimeoffData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
