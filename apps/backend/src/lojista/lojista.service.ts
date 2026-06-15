import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { StripeService } from '../stripe/stripe.service';
import { LOJA_REPOSITORY, USUARIO_REPOSITORY, FUNCIONARIO_LOJA_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IUsuarioRepository, IFuncionarioLojaRepository } from '@precoreal/domain';
import { anuncios, usuarios, funcionariosLojas } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class LojistaService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly stripeService: StripeService,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepository: IFuncionarioLojaRepository,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  async dashboard(usuarioId: string) {
    const lojasDoUsuario = await this.lojaRepository.findByProprietario(usuarioId);

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
    const loja = await this.lojaRepository.findById(lojaId);

    if (!loja || loja.usuarioProprietarioId !== proprietarioId) {
      throw new NotFoundException('Loja não encontrada ou não pertence a você.');
    }

    const usuario = await this.usuarioRepository.findByEmail(email);

    if (!usuario) {
      throw new NotFoundException('Usuário com este email não encontrado.');
    }

    const vinculoExistente = await this.funcionarioLojaRepository.findVinculo(usuario.id, lojaId);

    if (vinculoExistente) {
      throw new ConflictException('Este usuário já é funcionário desta loja.');
    }

    const vinculo = await this.funcionarioLojaRepository.create({
      usuarioId: usuario.id,
      lojaId,
      turnos: turnos.map((t) => JSON.stringify(t)),
    });

    return {
      id: vinculo.id,
      usuarioId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      lojaId: vinculo.lojaId,
      turnos,
      criadoEm: vinculo.criadoEm?.toISOString() || new Date().toISOString(),
    };
  }

  async atualizarTurnos(id: string, turnos: any[]) {
    const vinculo = await this.funcionarioLojaRepository.update(id, {
      turnos: turnos.map((t) => JSON.stringify(t)),
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo de funcionário não encontrado.');
    }

    return {
      id: vinculo.id,
      turnos,
    };
  }

  async removerFuncionario(id: string) {
    const vinculo = await this.funcionarioLojaRepository.delete(id);

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
