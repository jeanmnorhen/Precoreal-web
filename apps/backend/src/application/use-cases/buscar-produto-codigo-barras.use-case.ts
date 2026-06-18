import { Injectable, Inject } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';

@Injectable()
export class BuscarProdutoCodigoBarrasUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: { codigoBarras: string }) {
    return this.produtoRepository.findByCodigoBarras(input.codigoBarras);
  }
}
