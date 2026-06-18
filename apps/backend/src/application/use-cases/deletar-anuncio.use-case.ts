import { Injectable, Inject } from '@nestjs/common';
import { ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository, AnuncioData } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class DeletarAnuncioUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute(input: { id: string }): Promise<AnuncioData> {
    const anuncio = await this.anuncioRepo.delete(input.id);
    if (!anuncio) throw new NotFoundError('Anúncio não encontrado.');
    return anuncio;
  }
}
