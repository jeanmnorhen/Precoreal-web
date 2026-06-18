import { Injectable, Inject } from '@nestjs/common';
import { USUARIO_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository, IAnuncioRepository } from '@precoreal/domain';

@Injectable()
export class MonitorarUsoUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute() {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [usuariosPorDia, topProdutos] = await Promise.all([
      this.usuarioRepo.getRegistrationsByDay(trintaDiasAtras),
      this.anuncioRepo.getTopProdutos(trintaDiasAtras, 10),
    ]);

    return {
      volumeBuscas: usuariosPorDia.map((d) => ({
        data: d.data,
        total: d.total,
      })),
      produtosMaisBuscados: topProdutos.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        totalBuscas: p.totalBuscas,
      })),
      engajamento: usuariosPorDia.map((d) => ({
        data: d.data,
        usuariosAtivos: d.total,
      })),
    };
  }
}
