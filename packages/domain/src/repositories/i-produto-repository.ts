import type { ProdutoData } from '../entities';

export const PRODUTO_REPOSITORY = Symbol('PRODUTO_REPOSITORY');

export interface IProdutoRepository {
  findById(id: string): Promise<ProdutoData | null>;
  findByCodigoBarras(codigo: string): Promise<ProdutoData | null>;
  findAll(): Promise<ProdutoData[]>;
  search(query: string): Promise<ProdutoData[]>;
  create(data: Omit<ProdutoData, 'id' | 'criadoEm'>): Promise<ProdutoData>;
  update(id: string, data: Partial<Omit<ProdutoData, 'id' | 'criadoEm'>>): Promise<ProdutoData | null>;
  delete(id: string): Promise<ProdutoData | null>;
}
