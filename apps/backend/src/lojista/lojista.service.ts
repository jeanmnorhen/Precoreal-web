import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { StripeService } from '../stripe/stripe.service';
import { anuncios, lojas, usuarios, funcionariosLojas } from '@precoreal/shared';
import { eq, sql, and } from 'drizzle-orm';

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

  async listarFuncionarios(lojaId: string) {
    const vinculos = await this.db
      .select({
        id: funcionariosLojas.id,
        usuarioId: funcionariosLojas.usuarioId,
        nome: usuarios.nome,
        email: usuarios.email,
        lojaId: funcionariosLojas.lojaId,
        turnos: funcionariosLojas.turnos,
        criadoEm: funcionariosLojas.criadoEm,
      })
      .from(funcionariosLojas)
      .innerJoin(usuarios, eq(funcionariosLojas.usuarioId, usuarios.id))
      .where(eq(funcionariosLojas.lojaId, lojaId));

    return vinculos.map((v) => ({
      ...v,
      turnos: this.parseTurnos(v.turnos),
      criadoEm: v.criadoEm?.toISOString() || new Date().toISOString(),
    }));
  }

  async adicionarFuncionario(
    proprietarioId: string,
    email: string,
    lojaId: string,
    turnos: any[],
  ) {
    const loja = await this.db
      .select()
      .from(lojas)
      .where(
        and(eq(lojas.id, lojaId), eq(lojas.usuarioProprietarioId, proprietarioId)),
      )
      .limit(1);

    if (loja.length === 0) {
      throw new NotFoundException('Loja não encontrada ou não pertence a você.');
    }

    const usuario = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (usuario.length === 0) {
      throw new NotFoundException('Usuário com este email não encontrado.');
    }

    const vinculoExistente = await this.db
      .select()
      .from(funcionariosLojas)
      .where(
        and(
          eq(funcionariosLojas.usuarioId, usuario[0].id),
          eq(funcionariosLojas.lojaId, lojaId),
        ),
      )
      .limit(1);

    if (vinculoExistente.length > 0) {
      throw new ConflictException('Este usuário já é funcionário desta loja.');
    }

    const [vinculo] = await this.db
      .insert(funcionariosLojas)
      .values({
        usuarioId: usuario[0].id,
        lojaId,
        turnos: turnos.map((t) => JSON.stringify(t)),
      })
      .returning();

    return {
      id: vinculo.id,
      usuarioId: usuario[0].id,
      nome: usuario[0].nome,
      email: usuario[0].email,
      lojaId: vinculo.lojaId,
      turnos,
      criadoEm: vinculo.criadoEm?.toISOString() || new Date().toISOString(),
    };
  }

  async atualizarTurnos(id: string, turnos: any[]) {
    const [vinculo] = await this.db
      .update(funcionariosLojas)
      .set({ turnos: turnos.map((t) => JSON.stringify(t)) })
      .where(eq(funcionariosLojas.id, id))
      .returning();

    if (!vinculo) {
      throw new NotFoundException('Vínculo de funcionário não encontrado.');
    }

    return {
      id: vinculo.id,
      turnos,
    };
  }

  async removerFuncionario(id: string) {
    const [vinculo] = await this.db
      .delete(funcionariosLojas)
      .where(eq(funcionariosLojas.id, id))
      .returning();

    if (!vinculo) {
      throw new NotFoundException('Vínculo de funcionário não encontrado.');
    }

    return { removido: true };
  }

  private parseTurnos(turnos: string[] | null): any[] {
    if (!turnos || turnos.length === 0) return [];
    return turnos.map((t) => {
      try {
        return typeof t === 'string' ? JSON.parse(t) : t;
      } catch {
        return t;
      }
    });
  }
}
