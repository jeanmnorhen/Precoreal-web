import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { funcionariosLojas, lojas, anuncios, produtos } from '@precoreal/shared';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class FuncionarioService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async verificarAcesso(
    usuarioId: string,
    lojaId: string,
    latitude: number,
    longitude: number,
  ) {
    const vinculo = await this.db
      .select({
        lojaId: funcionariosLojas.lojaId,
        turnos: funcionariosLojas.turnos,
        lojaNome: lojas.nome,
        lojaPerimetro: lojas.perimetro,
        lojaRaio: lojas.perimetroRaioMetros,
        lojaLocalizacao: lojas.localizacao,
      })
      .from(funcionariosLojas)
      .innerJoin(lojas, eq(funcionariosLojas.lojaId, lojas.id))
      .where(
        and(
          eq(funcionariosLojas.usuarioId, usuarioId),
          eq(funcionariosLojas.lojaId, lojaId),
        ),
      )
      .limit(1);

    if (vinculo.length === 0) {
      throw new NotFoundException('Vínculo de funcionário não encontrado.');
    }

    const v = vinculo[0];
    const agora = new Date();
    const diaSemana = agora.getDay();
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    let horarioValido = false;
    if (v.turnos && v.turnos.length > 0) {
      for (const turno of v.turnos) {
        try {
          const turnoData = typeof turno === 'string' ? JSON.parse(turno) : turno;
          if (
            turnoData.diaSemana === diaSemana &&
            horaAtual >= turnoData.horaInicio &&
            horaAtual <= turnoData.horaFim
          ) {
            horarioValido = true;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    let dentroPerimetro = false;
    try {
      const result = await this.db.execute(
        sql`
          SELECT ST_DWithin(
            ${v.lojaLocalizacao}::geography,
            ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography,
            ${v.lojaRaio}
          ) as dentro
        `,
      );
      const firstRow = result.rows?.[0] as Record<string, unknown> | undefined;
      dentroPerimetro = firstRow?.dentro === true || firstRow?.dentro === 'true';
    } catch {
      dentroPerimetro = false;
    }

    const acessoPermitido = horarioValido && dentroPerimetro;

    return {
      acessoPermitido,
      mensagem: acessoPermitido
        ? 'Acesso permitido. Você está no horário e local de trabalho.'
        : 'Acesso negado. Verifique se está no perímetro da loja e em seu horário de trabalho.',
      lojaId: v.lojaId,
      lojaNome: v.lojaNome,
      dentoPerimetro: dentroPerimetro,
      horarioValido,
    };
  }

  async listarLojas(usuarioId: string) {
    return this.db
      .select({
        id: lojas.id,
        nome: lojas.nome,
        enderecoCidade: lojas.enderecoCidade,
        enderecoEstado: lojas.enderecoEstado,
      })
      .from(funcionariosLojas)
      .innerJoin(lojas, eq(funcionariosLojas.lojaId, lojas.id))
      .where(eq(funcionariosLojas.usuarioId, usuarioId));
  }

  async listarProdutos(lojaId: string) {
    return this.db
      .select()
      .from(produtos)
      .innerJoin(anuncios, eq(anuncios.produtoId, produtos.id))
      .where(eq(anuncios.lojaId, lojaId))
      .limit(100);
  }

  async listarAnuncios(lojaId: string) {
    return this.db
      .select()
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .where(
        and(
          eq(anuncios.lojaId, lojaId),
          eq(anuncios.status, 'ativo'),
        ),
      )
      .limit(100);
  }
}
