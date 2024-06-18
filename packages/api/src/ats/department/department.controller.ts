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
import { DepartmentService } from './services/department.service';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/department')
@Controller('ats/department')
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(DepartmentController.name);
  }

  @ApiOperation({
    operationId: 'getDepartments',
    summary: 'List a batch of Departments',
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
  @ApiCustomResponse(UnifiedDepartmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getDepartments(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.departmentService.getDepartments(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getDepartment',
    summary: 'Retrieve a Department',
    description: 'Retrieve a department from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the department you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedDepartmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getDepartment(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.departmentService.getDepartment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addDepartment',
    summary: 'Create a Department',
    description: 'Create a department in any supported Ats software',
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
  @ApiBody({ type: UnifiedDepartmentInput })
  @ApiCustomResponse(UnifiedDepartmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addDepartment(
    @Body() unifiedDepartmentData: UnifiedDepartmentInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.departmentService.addDepartment(
        unifiedDepartmentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addDepartments',
    summary: 'Add a batch of Departments',
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
  @ApiBody({ type: UnifiedDepartmentInput, isArray: true })
  @ApiCustomResponse(UnifiedDepartmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addDepartments(
    @Body() unfiedDepartmentData: UnifiedDepartmentInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.departmentService.batchAddDepartments(
        unfiedDepartmentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
