import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, LojaData } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class BuscarLojaPorIdUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(input: { id: string }): Promise<LojaData> {
    const loja = await this.lojaRepository.findById(input.id);
    if (!loja) throw new NotFoundError('Loja não encontrada.');
    return loja;
  }
}
