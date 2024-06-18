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
import { PermissionService } from './services/permission.service';
import {
  UnifiedPermissionInput,
  UnifiedPermissionOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('filestorage/permission')
@Controller('filestorage/permission')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(PermissionController.name);
  }

  @ApiOperation({
    operationId: 'getPermissions',
    summary: 'List a batch of Permissions',
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
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedPermissionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getPermissions(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.permissionService.getPermissions(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getPermission',
    summary: 'Retrieve a Permission',
    description:
      'Retrieve a permission from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the permission you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedPermissionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getPermission(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.permissionService.getPermission(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addPermission',
    summary: 'Create a Permission',
    description: 'Create a permission in any supported Filestorage software',
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
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiBody({ type: UnifiedPermissionInput })
  @ApiCustomResponse(UnifiedPermissionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addPermission(
    @Body() unifiedPermissionData: UnifiedPermissionInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.permissionService.addPermission(
        unifiedPermissionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addPermissions',
    summary: 'Add a batch of Permissions',
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
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiBody({ type: UnifiedPermissionInput, isArray: true })
  @ApiCustomResponse(UnifiedPermissionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addPermissions(
    @Body() unfiedPermissionData: UnifiedPermissionInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.permissionService.batchAddPermissions(
        unfiedPermissionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'updatePermission',
    summary: 'Update a Permission',
  })
  @ApiCustomResponse(UnifiedPermissionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updatePermission(
    @Query('id') id: string,
    @Body() updatePermissionData: Partial<UnifiedPermissionInput>,
  ) {
    return;
  }
}
