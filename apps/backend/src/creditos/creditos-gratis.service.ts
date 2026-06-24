import { Injectable, Inject, Logger } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { creditosGratuitos, usuarios } from '@precoreal/shared';
import { eq, and, lte, sql } from 'drizzle-orm';

@Injectable()
export class CreditosGratisService {
  private readonly logger = new Logger(CreditosGratisService.name);

  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async concederCreditosMensais(): Promise<number> {
    const lojistas = await this.db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.tipo, 'lojista'));

    let concedidos = 0;

    for (const lojista of lojistas) {
      const agora = new Date();
      const expira = new Date(agora);
      expira.setDate(expira.getDate() + 30);

      await this.db.insert(creditosGratuitos).values({
        usuarioId: lojista.id,
        quantidade: 30,
        concedidoEm: agora,
        expiraEm: expira,
        expirado: false,
      });

      await this.db
        .update(usuarios)
        .set({ saldoCreditos: sql`${usuarios.saldoCreditos} + 30` })
        .where(eq(usuarios.id, lojista.id));

      concedidos++;
    }

    this.logger.log(`${concedidos} lojistas receberam 30 créditos grátis.`);
    return concedidos;
  }

  async expirarCreditosVencidos(): Promise<number> {
    const agora = new Date();

    const expirados = await this.db
      .select()
      .from(creditosGratuitos)
      .where(
        and(
          lte(creditosGratuitos.expiraEm, agora),
          eq(creditosGratuitos.expirado, false),
        ),
      );

    for (const credito of expirados) {
      await this.db
        .update(usuarios)
        .set({
          saldoCreditos: sql`GREATEST(${usuarios.saldoCreditos} - ${credito.quantidade}, 0)`,
        })
        .where(eq(usuarios.id, credito.usuarioId));

      await this.db
        .update(creditosGratuitos)
        .set({ expirado: true })
        .where(eq(creditosGratuitos.id, credito.id));
    }

    this.logger.log(`${expirados.length} créditos grátis expirados.`);
    return expirados.length;
  }

  proximoDiaConcessao(): Date {
    const agora = new Date();
    const proximo = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
    return proximo;
  }

  async obterInfoUsuario(usuarioId: string): Promise<{
    recebidosEsteMes: boolean;
    proximaConcessao: string;
    expiraEm: string | null;
  }> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

    const [creditoAtivo] = await this.db
      .select()
      .from(creditosGratuitos)
      .where(
        and(
          eq(creditosGratuitos.usuarioId, usuarioId),
          eq(creditosGratuitos.expirado, false),
          lte(creditosGratuitos.concedidoEm, fimMes),
        ),
      )
      .orderBy(creditosGratuitos.concedidoEm)
      .limit(1);

    const recebidosEsteMes = !!creditoAtivo;
    const proximaConcessao = this.proximoDiaConcessao();
    const expiraEm = creditoAtivo ? creditoAtivo.expiraEm.toISOString() : null;

    return {
      recebidosEsteMes,
      proximaConcessao: proximaConcessao.toISOString(),
      expiraEm,
    };
  }
}
