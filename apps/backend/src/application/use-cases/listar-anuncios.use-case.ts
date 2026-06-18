import { Injectable, Inject } from '@nestjs/common';
import { ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository, AnuncioData } from '@precoreal/domain';

@Injectable()
export class ListarAnunciosUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute(): Promise<AnuncioData[]> {
    return this.anuncioRepo.findAll();
  }
}
