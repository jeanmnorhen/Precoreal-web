import { Injectable, Inject } from '@nestjs/common';
import { USUARIO_REPOSITORY, LOJA_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository, ILojaRepository, IAnuncioRepository } from '@precoreal/domain';

@Injectable()
export class ObterDashboardAdminUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepo: ILojaRepository,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute() {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [usuariosAtivos, totalOfertas, novasLojas] = await Promise.all([
      this.usuarioRepo.countByDateRange(trintaDiasAtras),
      this.anuncioRepo.countAll(),
      this.lojaRepo.countByDateRange(trintaDiasAtras),
    ]);

    return { usuariosAtivos, totalOfertas, novasLojas };
  }
}
