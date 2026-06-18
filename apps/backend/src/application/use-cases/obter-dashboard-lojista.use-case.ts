import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IAnuncioRepository } from '@precoreal/domain';

@Injectable()
export class ObterDashboardLojistaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepository: IAnuncioRepository,
  ) {}

  async execute(input: { usuarioId: string }) {
    const lojasDoUsuario = await this.lojaRepository.findByProprietario(input.usuarioId);
    const lojaIds = lojasDoUsuario.map((l) => l.id);

    if (lojaIds.length === 0) {
      return {
        totalLojas: 0,
        totalAnunciosAtivos: 0,
        totalAnuncios: 0,
      };
    }

    const anuncioStats = await this.anuncioRepository.countByLojaIds(lojaIds);

    return {
      totalLojas: lojaIds.length,
      totalAnuncios: anuncioStats.total,
      totalAnunciosAtivos: anuncioStats.ativos,
    };
  }
}
