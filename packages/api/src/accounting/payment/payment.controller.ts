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
import { PaymentService } from './services/payment.service';
import {
  UnifiedPaymentInput,
  UnifiedPaymentOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/payment')
@Controller('accounting/payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(PaymentController.name);
  }

  @ApiOperation({
    operationId: 'getPayments',
    summary: 'List a batch of Payments',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedPaymentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getPayments(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.paymentService.getPayments(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getPayment',
    summary: 'Retrieve a Payment',
    description: 'Retrieve a payment from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the payment you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedPaymentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getPayment(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.paymentService.getPayment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addPayment',
    summary: 'Create a Payment',
    description: 'Create a payment in any supported Accounting software',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedPaymentInput })
  @ApiCustomResponse(UnifiedPaymentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addPayment(
    @Body() unifiedPaymentData: UnifiedPaymentInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.paymentService.addPayment(
        unifiedPaymentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addPayments',
    summary: 'Add a batch of Payments',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedPaymentInput, isArray: true })
  @ApiCustomResponse(UnifiedPaymentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addPayments(
    @Body() unfiedPaymentData: UnifiedPaymentInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.paymentService.batchAddPayments(
        unfiedPaymentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
