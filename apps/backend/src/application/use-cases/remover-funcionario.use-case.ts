import { Injectable, Inject } from '@nestjs/common';
import { FUNCIONARIO_LOJA_REPOSITORY } from '@precoreal/domain';
import type { IFuncionarioLojaRepository } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class RemoverFuncionarioUseCase {
  constructor(
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepository: IFuncionarioLojaRepository,
  ) {}

  async execute(input: { id: string }) {
    const vinculo = await this.funcionarioLojaRepository.delete(input.id);
    if (!vinculo) {
      throw new NotFoundError('Vínculo de funcionário não encontrado.');
    }
    return { removido: true };
  }
}
