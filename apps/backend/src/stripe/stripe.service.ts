import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { usuarios } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe!: Stripe;

  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  onModuleInit() {
    const key = process.env.STRIPE_RESTRICTED_KEY;
    if (!key) {
      throw new Error(
        'A variável de ambiente STRIPE_RESTRICTED_KEY não está configurada.',
      );
    }
    this.stripe = new Stripe(key, {
      apiVersion: '2024-04-10',
    });
  }

  async createPaymentIntent(
    valorCentavos: number,
    email: string,
    usuarioId: string,
  ) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: valorCentavos,
      currency: 'brl',
      metadata: {
        usuarioId,
        creditosAAdicionar: valorCentavos.toString(),
      },
      receipt_email: email,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret não configurado.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Assinatura do webhook inválida: ${(err as Error).message}`,
      );
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await this.processarPagamentoBemSucedido(paymentIntent);
    }

    return { received: true };
  }

  private async processarPagamentoBemSucedido(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const usuarioId = paymentIntent.metadata.usuarioId;
    const creditos = parseInt(
      paymentIntent.metadata.creditosAAdicionar || '0',
      10,
    );

    if (!usuarioId || creditos <= 0) return;

    await this.db
      .update(usuarios)
      .set({
        saldoCreditos: sql`${usuarios.saldoCreditos} + ${creditos}`,
      })
      .where(eq(usuarios.id, usuarioId));
  }
}
