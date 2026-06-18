import { Injectable, Inject } from '@nestjs/common';
import { StripeService } from '../../stripe/stripe.service';

@Injectable()
export class ComprarCreditosUseCase {
  constructor(
    private readonly stripeService: StripeService,
  ) {}

  async execute(input: { usuarioId: string; email: string; valorCentavos: number }) {
    return this.stripeService.createPaymentIntent(
      input.valorCentavos,
      input.email,
      input.usuarioId,
    );
  }
}
