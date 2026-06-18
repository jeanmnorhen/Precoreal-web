import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IAnuncioRepository } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class ObterPerfilPublicoLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepository: IAnuncioRepository,
  ) {}

  async execute(input: { lojaId: string }) {
    const loja = await this.lojaRepository.findById(input.lojaId);
    if (!loja) throw new NotFoundError('Loja não encontrada.');

    const anuncios = await this.anuncioRepository.findAll({ lojaId: input.lojaId, status: 'ativo' });
    anuncios.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return { ...loja, anuncios };
  }
}
