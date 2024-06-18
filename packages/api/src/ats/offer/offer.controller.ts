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
import { OfferService } from './services/offer.service';
import { UnifiedOfferInput, UnifiedOfferOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/offer')
@Controller('ats/offer')
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(OfferController.name);
  }

  @ApiOperation({
    operationId: 'getOffers',
    summary: 'List a batch of Offers',
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
  @ApiCustomResponse(UnifiedOfferOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getOffers(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.offerService.getOffers(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getOffer',
    summary: 'Retrieve a Offer',
    description: 'Retrieve a offer from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the offer you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedOfferOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getOffer(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.offerService.getOffer(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addOffer',
    summary: 'Create a Offer',
    description: 'Create a offer in any supported Ats software',
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
  @ApiBody({ type: UnifiedOfferInput })
  @ApiCustomResponse(UnifiedOfferOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addOffer(
    @Body() unifiedOfferData: UnifiedOfferInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.offerService.addOffer(
        unifiedOfferData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addOffers',
    summary: 'Add a batch of Offers',
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
  @ApiBody({ type: UnifiedOfferInput, isArray: true })
  @ApiCustomResponse(UnifiedOfferOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addOffers(
    @Body() unfiedOfferData: UnifiedOfferInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.offerService.batchAddOffers(
        unfiedOfferData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
