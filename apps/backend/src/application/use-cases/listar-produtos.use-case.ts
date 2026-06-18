import { Injectable, Inject } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';

@Injectable()
export class ListarProdutosUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input?: { busca?: string }) {
    if (input?.busca) {
      return this.produtoRepository.search(input.busca);
    }
    return this.produtoRepository.findAll();
  }
}
