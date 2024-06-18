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
import { BankInfoService } from './services/bankinfo.service';
import {
  UnifiedBankInfoInput,
  UnifiedBankInfoOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('hris/bankinfo')
@Controller('hris/bankinfo')
export class BankinfoController {
  constructor(
    private readonly bankinfoService: BankInfoService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(BankinfoController.name);
  }

  @ApiOperation({
    operationId: 'getBankinfos',
    summary: 'List a batch of Bankinfos',
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
  @ApiCustomResponse(UnifiedBankInfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getBankinfos(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.bankinfoService.getBankinfos(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getBankinfo',
    summary: 'Retrieve a Bankinfo',
    description: 'Retrieve a bankinfo from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the bankinfo you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedBankInfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getBankinfo(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.bankinfoService.getBankinfo(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addBankinfo',
    summary: 'Create a Bankinfo',
    description: 'Create a bankinfo in any supported Hris software',
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
  @ApiBody({ type: UnifiedBankInfoInput })
  @ApiCustomResponse(UnifiedBankInfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addBankinfo(
    @Body() unifiedBankinfoData: UnifiedBankInfoInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.bankinfoService.addBankinfo(
        unifiedBankinfoData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addBankinfos',
    summary: 'Add a batch of Bankinfos',
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
  @ApiBody({ type: UnifiedBankInfoInput, isArray: true })
  @ApiCustomResponse(UnifiedBankInfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addBankinfos(
    @Body() unfiedBankinfoData: UnifiedBankInfoInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.bankinfoService.batchAddBankinfos(
        unfiedBankinfoData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
