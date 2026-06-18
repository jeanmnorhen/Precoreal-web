import { Injectable, Inject } from '@nestjs/common';
import {
  LOJA_REPOSITORY, USUARIO_REPOSITORY,
  FUNCIONARIO_LOJA_REPOSITORY,
} from '@precoreal/domain';
import type {
  ILojaRepository, IUsuarioRepository,
  IFuncionarioLojaRepository,
} from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';
import { ConflictError } from '../errors/conflict.error';

@Injectable()
export class AdicionarFuncionarioUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepository: IFuncionarioLojaRepository,
  ) {}

  async execute(input: {
    proprietarioId: string;
    email: string;
    lojaId: string;
    turnos: any[];
  }) {
    const loja = await this.lojaRepository.findById(input.lojaId);
    if (!loja || loja.usuarioProprietarioId !== input.proprietarioId) {
      throw new NotFoundError('Loja não encontrada ou não pertence a você.');
    }

    const usuario = await this.usuarioRepository.findByEmail(input.email);
    if (!usuario) {
      throw new NotFoundError('Usuário com este email não encontrado.');
    }

    const vinculoExistente = await this.funcionarioLojaRepository.findVinculo(usuario.id, input.lojaId);
    if (vinculoExistente) {
      throw new ConflictError('Este usuário já é funcionário desta loja.');
    }

    const vinculo = await this.funcionarioLojaRepository.create({
      usuarioId: usuario.id,
      lojaId: input.lojaId,
      turnos: input.turnos.map((t: any) => JSON.stringify(t)),
    });

    return {
      id: vinculo.id,
      usuarioId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      lojaId: vinculo.lojaId,
      turnos: input.turnos,
      criadoEm: vinculo.criadoEm?.toISOString() || new Date().toISOString(),
    };
  }
}
