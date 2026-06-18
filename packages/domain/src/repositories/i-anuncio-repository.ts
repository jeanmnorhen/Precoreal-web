import type { AnuncioData, TipoAnuncio, StatusAnuncio } from '../entities';

export const ANUNCIO_REPOSITORY = Symbol('ANUNCIO_REPOSITORY');

export interface AnuncioStats {
  total: number;
  ativos: number;
}

export interface NearbyAdResult {
  id: string;
  titulo: string;
  tipo: string;
  distancia: number;
  lojaNome: string;
  lojaLatitude: number;
  lojaLongitude: number;
  produtoNome: string;
  codigoBarras: string;
  precoMedio: number;
}

export interface TopProdutoData {
  produtoId: string;
  nome: string;
  totalBuscas: number;
}

export interface IAnuncioRepository {
  findById(id: string): Promise<AnuncioData | null>;
  findAll(params?: { lojaId?: string; status?: StatusAnuncio; tipo?: TipoAnuncio }): Promise<AnuncioData[]>;
  countByLojaIds(lojaIds: string[]): Promise<AnuncioStats>;
  countAll(): Promise<number>;
  findProximos(latitude: number, longitude: number, tipo?: string, limit?: number): Promise<NearbyAdResult[]>;
  findAtivosComDetalhes(limit: number): Promise<NearbyAdResult[]>;
  getTopProdutos(desde: Date, limit: number): Promise<TopProdutoData[]>;
  create(data: Omit<AnuncioData, 'id' | 'criadoEm'>): Promise<AnuncioData>;
  update(id: string, data: Partial<Omit<AnuncioData, 'id' | 'criadoEm' | 'lojaId'>>): Promise<AnuncioData | null>;
  delete(id: string): Promise<AnuncioData | null>;
}
