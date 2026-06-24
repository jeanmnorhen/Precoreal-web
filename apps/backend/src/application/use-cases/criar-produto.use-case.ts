import { Injectable, Inject } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';
import { ConflictError } from '../errors/conflict.error';

@Injectable()
export class CriarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: {
    codigoBarras: string;
    nome: string;
    descricao?: string;
    categoria: string;
    marca: string;
    ncm?: string;
    precoMedio?: number;
    listaImagens?: string[];
  }) {
    const existing = await this.produtoRepository.findByCodigoBarras(input.codigoBarras);
    if (existing) {
      throw new ConflictError('Produto com este código de barras já existe.');
    }

    return this.produtoRepository.create(input as any);
  }
}
