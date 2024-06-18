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
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CandidateService } from './services/candidate.service';

@ApiTags('ats/candidate')
@Controller('ats/candidate')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CandidateController.name);
  }

  @ApiOperation({
    operationId: 'getCandidates',
    summary: 'List a batch of Candidates',
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
  @ApiCustomResponse(UnifiedCandidateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCandidates(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.candidateService.getCandidates(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCandidate',
    summary: 'Retrieve a Candidate',
    description: 'Retrieve a candidate from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the candidate you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedCandidateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCandidate(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.candidateService.getCandidate(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCandidate',
    summary: 'Create a Candidate',
    description: 'Create a candidate in any supported Ats software',
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
  @ApiBody({ type: UnifiedCandidateInput })
  @ApiCustomResponse(UnifiedCandidateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCandidate(
    @Body() unifiedCandidateData: UnifiedCandidateInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.candidateService.addCandidate(
        unifiedCandidateData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addCandidates',
    summary: 'Add a batch of Candidates',
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
  @ApiBody({ type: UnifiedCandidateInput, isArray: true })
  @ApiCustomResponse(UnifiedCandidateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addCandidates(
    @Body() unfiedCandidateData: UnifiedCandidateInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.candidateService.batchAddCandidates(
        unfiedCandidateData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
