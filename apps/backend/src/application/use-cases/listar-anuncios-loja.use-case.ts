import { Injectable, Inject } from '@nestjs/common';
import { ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository } from '@precoreal/domain';

@Injectable()
export class ListarAnunciosLojaUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute(input: { lojaId: string }) {
    return this.anuncioRepo.findAll({ lojaId: input.lojaId, status: 'ativo' });
  }
}
