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
import { UserService } from './services/user.service';
import { UnifiedUserInput, UnifiedUserOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/user')
@Controller('marketingautomation/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(UserController.name);
  }

  @ApiOperation({
    operationId: 'getMarketingAutomationUsers',
    summary: 'List a batch of Users',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getUsers(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.userService.getUsers(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getMarketingAutomationUser',
    summary: 'Retrieve a User',
    description:
      'Retrieve a user from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the user you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getUser(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.userService.getUser(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addMarketingAutomationUser',
    summary: 'Create a User',
    description: 'Create a user in any supported Marketingautomation software',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiBody({ type: UnifiedUserInput })
  @ApiCustomResponse(UnifiedUserOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addUser(
    @Body() unifiedUserData: UnifiedUserInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.userService.addUser(
        unifiedUserData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addMarketingAutomationUsers',
    summary: 'Add a batch of Users',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiBody({ type: UnifiedUserInput, isArray: true })
  @ApiCustomResponse(UnifiedUserOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addUsers(
    @Body() unfiedUserData: UnifiedUserInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.userService.batchAddUsers(
        unfiedUserData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
