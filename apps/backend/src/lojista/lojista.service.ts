import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { StripeService } from '../stripe/stripe.service';
import { anuncios, lojas } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class LojistaService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly stripeService: StripeService,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  async dashboard(usuarioId: string) {
    const lojasDoUsuario = await this.db
      .select({ id: lojas.id })
      .from(lojas)
      .where(eq(lojas.usuarioProprietarioId, usuarioId));

    const lojaIds = lojasDoUsuario.map((l) => l.id);

    if (lojaIds.length === 0) {
      return {
        totalLojas: 0,
        totalAnunciosAtivos: 0,
        totalAnuncios: 0,
        totalProdutos: 0,
      };
    }

    const [anuncioStats] = await this.db
      .select({
        total: sql<number>`count(*)`.as<number>(),
        ativos: sql<number>`count(*) filter (where ${anuncios.status} = 'ativo')`,
      })
      .from(anuncios)
      .where(sql`${anuncios.lojaId} = any(${lojaIds}::uuid[])`);

    return {
      totalLojas: lojaIds.length,
      totalAnuncios: Number(anuncioStats?.total || 0),
      totalAnunciosAtivos: Number(anuncioStats?.ativos || 0),
    };
  }

  async comprarCreditos(
    usuarioId: string,
    email: string,
    valorCentavos: number,
  ) {
    return this.stripeService.createPaymentIntent(
      valorCentavos,
      email,
      usuarioId,
    );
  }
}
