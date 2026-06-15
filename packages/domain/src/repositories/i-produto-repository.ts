import type { ProdutoData } from '../entities';

export const PRODUTO_REPOSITORY = Symbol('PRODUTO_REPOSITORY');

export interface IProdutoRepository {
  findById(id: string): Promise<ProdutoData | null>;
  findByCodigoBarras(codigo: string): Promise<ProdutoData | null>;
  search(query: string): Promise<ProdutoData[]>;
  create(data: Omit<ProdutoData, 'id' | 'criadoEm'>): Promise<ProdutoData>;
}
