import { Injectable, Inject } from '@nestjs/common';
import { FUNCIONARIO_LOJA_REPOSITORY } from '@precoreal/domain';
import type { IFuncionarioLojaRepository } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class AtualizarTurnosFuncionarioUseCase {
  constructor(
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepository: IFuncionarioLojaRepository,
  ) {}

  async execute(input: { id: string; turnos: any[] }) {
    const vinculo = await this.funcionarioLojaRepository.update(input.id, {
      turnos: input.turnos.map((t) => JSON.stringify(t)),
    });

    if (!vinculo) {
      throw new NotFoundError('Vínculo de funcionário não encontrado.');
    }

    return {
      id: vinculo.id,
      turnos: input.turnos,
    };
  }
}
