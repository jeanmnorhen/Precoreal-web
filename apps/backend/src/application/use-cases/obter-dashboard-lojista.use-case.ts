import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IAnuncioRepository } from '@precoreal/domain';
import { CreditosGratisService } from '../../creditos/creditos-gratis.service';

@Injectable()
export class ObterDashboardLojistaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepository: IAnuncioRepository,
    private readonly creditosGratisService: CreditosGratisService,
  ) {}

  async execute(input: { usuarioId: string }) {
    const lojasDoUsuario = await this.lojaRepository.findByProprietario(input.usuarioId);
    const lojaIds = lojasDoUsuario.map((l) => l.id);

    if (lojaIds.length === 0) {
      return {
        totalLojas: 0,
        totalAnunciosAtivos: 0,
        totalAnuncios: 0,
        creditosGratis: {
          recebidosEsteMes: false,
          proximaConcessao: this.creditosGratisService.proximoDiaConcessao().toISOString(),
          expiraEm: null,
        },
      };
    }

    const anuncioStats = await this.anuncioRepository.countByLojaIds(lojaIds);
    const creditosInfo = await this.creditosGratisService.obterInfoUsuario(input.usuarioId);

    return {
      totalLojas: lojaIds.length,
      totalAnuncios: anuncioStats.total,
      totalAnunciosAtivos: anuncioStats.ativos,
      creditosGratis: creditosInfo,
    };
  }
}
