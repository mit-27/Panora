import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { CompanyService } from './services/company.service';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

@ApiBearerAuth('JWT')
@ApiTags('crm/companies')
@Controller('crm/companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CompanyController.name);
  }

  @ApiOperation({
    operationId: 'getCompanies',
    summary: 'List a batch of Companies',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedCompanyOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getCompanies(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, pageSize, cursor } = query;
      return this.companyService.getCompanies(
        remoteSource,
        linkedUserId,
        pageSize,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCrmCompany',
    summary: 'Retrieve a Company',
    description: 'Retrieve a company from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the company you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedCompanyOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCompany(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.companyService.getCompany(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCrmCompany',
    summary: 'Create a Company',
    description: 'Create a company in any supported Crm software',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedCompanyInput })
  @ApiCustomResponse(UnifiedCompanyOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCompany(
    @Body() unifiedCompanyData: UnifiedCompanyInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.companyService.addCompany(
        unifiedCompanyData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addCompanies',
    summary: 'Add a batch of Companies',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedCompanyInput, isArray: true })
  @ApiCustomResponse(UnifiedCompanyOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addCompanies(
    @Body() unfiedCompanyData: UnifiedCompanyInput[],
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.companyService.batchAddCompanies(
        unfiedCompanyData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'updateCompany',
    summary: 'Update a Company',
  })
  @ApiCustomResponse(UnifiedCompanyOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateCompany(
    @Query('id') id: string,
    @Body() updateCompanyData: Partial<UnifiedCompanyInput>,
  ) {
    return this.companyService.updateCompany(id, updateCompanyData);
  }
}
