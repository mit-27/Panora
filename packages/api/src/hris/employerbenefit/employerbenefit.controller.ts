import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ConnectionUtils } from '@@core/connections/@utils';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
} from '@@core/utils/dtos/openapi.respone.dto';
import { QueryDto } from '@@core/utils/dtos/query.dto';
import { EmployerBenefitService } from './services/employerbenefit.service';
import { UnifiedHrisEmployerbenefitOutput } from './types/model.unified';

@ApiTags('hris/employerbenefits')
@Controller('hris/employerbenefits')
export class EmployerBenefitController {
  constructor(
    private readonly employerbenefitService: EmployerBenefitService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(EmployerBenefitController.name);
  }

  @ApiOperation({
    operationId: 'listHrisEmployerBenefits',
    summary: 'List Employer Benefits',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedHrisEmployerbenefitOutput)
  @UseGuards(ApiKeyAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  @Get()
  async getEmployerBenefits(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: QueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.employerbenefitService.getEmployerBenefits(
        connectionId,
        projectId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieveHrisEmployerBenefit',
    summary: 'Retrieve Employer Benefit',
    description:
      'Retrieve an Employer Benefit from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the employer benefit you want to retrieve.',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
    example: false,
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedHrisEmployerbenefitOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource, connectionId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.employerbenefitService.getEmployerBenefit(
      id,
      linkedUserId,
      remoteSource,
      connectionId,
      projectId,
      remote_data,
    );
  }
}
