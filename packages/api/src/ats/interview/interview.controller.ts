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
import { InterviewService } from './services/interview.service';
import {
  UnifiedInterviewInput,
  UnifiedInterviewOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/interview')
@Controller('ats/interview')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(InterviewController.name);
  }

  @ApiOperation({
    operationId: 'getInterviews',
    summary: 'List a batch of Interviews',
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
  @ApiCustomResponse(UnifiedInterviewOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getInterviews(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.interviewService.getInterviews(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getInterview',
    summary: 'Retrieve a Interview',
    description: 'Retrieve a interview from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the interview you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedInterviewOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getInterview(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.interviewService.getInterview(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addInterview',
    summary: 'Create a Interview',
    description: 'Create a interview in any supported Ats software',
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
  @ApiBody({ type: UnifiedInterviewInput })
  @ApiCustomResponse(UnifiedInterviewOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addInterview(
    @Body() unifiedInterviewData: UnifiedInterviewInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.interviewService.addInterview(
        unifiedInterviewData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addInterviews',
    summary: 'Add a batch of Interviews',
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
  @ApiBody({ type: UnifiedInterviewInput, isArray: true })
  @ApiCustomResponse(UnifiedInterviewOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addInterviews(
    @Body() unfiedInterviewData: UnifiedInterviewInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.interviewService.batchAddInterviews(
        unfiedInterviewData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
