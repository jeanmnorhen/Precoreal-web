import { Controller, Post, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<FastifyRequest>,
  ) {
    return this.stripeService.handleWebhook(
      signature,
      request.rawBody as Buffer,
    );
  }
}
