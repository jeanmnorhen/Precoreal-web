import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, LojaData } from '@precoreal/domain';

@Injectable()
export class ListarLojasProprietarioUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(input: { usuarioId: string }): Promise<LojaData[]> {
    return this.lojaRepository.findByProprietario(input.usuarioId);
  }
}
