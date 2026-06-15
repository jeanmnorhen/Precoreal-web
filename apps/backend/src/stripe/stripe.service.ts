import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { usuarios } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe!: Stripe;
  private circuitOpen = false;
  private consecutiveFailures = 0;
  private lastFailureTime = 0;

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

  private async withCircuitBreaker<T>(fn: () => Promise<T>): Promise<T> {
    // Circuit breaker: 3 falhas consecutivas em 20s abre o circuito
    if (this.circuitOpen) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed > 20000) {
        this.circuitOpen = false;
        this.consecutiveFailures = 0;
      } else {
        throw new Error(
          'Serviço de pagamento temporariamente indisponível. Tente novamente em alguns instantes.',
        );
      }
    }

    try {
      const result = await fn();
      this.consecutiveFailures = 0;
      return result;
    } catch (err) {
      this.consecutiveFailures++;
      this.lastFailureTime = Date.now();
      if (this.consecutiveFailures >= 3) {
        this.circuitOpen = true;
      }
      throw err;
    }
  }

  async createPaymentIntent(
    valorCentavos: number,
    email: string,
    usuarioId: string,
  ) {
    return this.withCircuitBreaker(async () => {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: valorCentavos,
        currency: 'brl',
        metadata: {
          usuarioId,
          creditosAAdicionar: Math.floor(valorCentavos / 100).toString(),
        },
        receipt_email: email,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    });
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurado.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(
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
