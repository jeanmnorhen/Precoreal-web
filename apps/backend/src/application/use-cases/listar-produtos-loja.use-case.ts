import { Injectable, Inject } from '@nestjs/common';
import { ANUNCIO_REPOSITORY, PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository, IProdutoRepository } from '@precoreal/domain';

@Injectable()
export class ListarProdutosLojaUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepo: IProdutoRepository,
  ) {}

  async execute(input: { lojaId: string }) {
    const anuncios = await this.anuncioRepo.findAll({ lojaId: input.lojaId });
    const produtos = await Promise.all(
      anuncios.map((a) => this.produtoRepo.findById(a.produtoId)),
    );
    return produtos.filter(Boolean);
  }
}
