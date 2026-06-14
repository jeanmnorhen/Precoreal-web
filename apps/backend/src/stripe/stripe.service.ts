import { Injectable, OnModuleInit } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe!: Stripe;

  onModuleInit() {
    const key = process.env.STRIPE_RESTRICTED_KEY;
    if (!key) {
      throw new Error('A variável de ambiente STRIPE_RESTRICTED_KEY não está configurada.');
    }
    this.stripe = new Stripe(key, {
      apiVersion: '2024-04-10' as any,
    });
  }

  /**
   * Cria uma intenção de pagamento (PaymentIntent) para compra de créditos
   * @param valorCentavos Valor em centavos (BRL)
   * @param email Email do lojista
   * @param usuarioId ID do usuário para fins de conciliação no webhook/metadados
   */
  async createPaymentIntent(valorCentavos: number, email: string, usuarioId: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: valorCentavos,
      currency: 'brl',
      metadata: {
        usuarioId,
        creditosAAdicionar: valorCentavos.toString(), // 1 centavo = 1 crédito (ou qualquer taxa de conversão)
      },
      receipt_email: email,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    };
  }
}
