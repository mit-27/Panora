import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { UserService } from './services/user.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { UnifiedUserOutput } from './types/model.unified';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

@ApiBearerAuth('JWT')
@ApiTags('ticketing/users')
@Controller('ticketing/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(UserController.name);
  }

  @ApiOperation({
    operationId: 'getTicketingUsers',
    summary: 'List a batch of Users',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getUsers(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    const { remote_data, pageSize, cursor } = query;

    return this.userService.getUsers(
      remoteSource,
      linkedUserId,
      pageSize,
      remote_data,
      cursor,
    );
  }

  @ApiOperation({
    operationId: 'getTicketingUser',
    summary: 'Retrieve a User',
    description: 'Retrieve a user from any connected Ticketing software',
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
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getUser(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.userService.getUser(id, remote_data);
  }
}
