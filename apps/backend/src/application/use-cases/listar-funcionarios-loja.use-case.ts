import { Injectable, Inject } from '@nestjs/common';
import {
  FUNCIONARIO_LOJA_REPOSITORY, USUARIO_REPOSITORY,
} from '@precoreal/domain';
import type {
  IFuncionarioLojaRepository, IUsuarioRepository,
} from '@precoreal/domain';

@Injectable()
export class ListarFuncionariosLojaUseCase {
  constructor(
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepository: IFuncionarioLojaRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(input: { lojaId: string }) {
    const vinculos = await this.funcionarioLojaRepository.findByLojaId(input.lojaId);
    const funcionarios = await Promise.all(
      vinculos.map(async (v) => {
        const user = await this.usuarioRepository.findById(v.usuarioId);
        return {
          id: v.id,
          usuarioId: v.usuarioId,
          nome: user?.nome || '',
          email: user?.email || '',
          lojaId: v.lojaId,
          turnos: this.parseTurnos(v.turnos),
          criadoEm: v.criadoEm?.toISOString() || new Date().toISOString(),
        };
      }),
    );
    return funcionarios;
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
