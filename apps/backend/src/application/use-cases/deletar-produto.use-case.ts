import { Injectable, Inject } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class DeletarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: { id: string }) {
    const produto = await this.produtoRepository.delete(input.id);
    if (!produto) throw new NotFoundError('Produto não encontrado.');
    return produto;
  }
}
