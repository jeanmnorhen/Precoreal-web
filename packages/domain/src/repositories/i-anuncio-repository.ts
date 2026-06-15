import type { AnuncioData, TipoAnuncio, StatusAnuncio } from '../entities';

export const ANUNCIO_REPOSITORY = Symbol('ANUNCIO_REPOSITORY');

export interface IAnuncioRepository {
  findById(id: string): Promise<AnuncioData | null>;
  findAll(params?: { lojaId?: string; status?: StatusAnuncio; tipo?: TipoAnuncio }): Promise<AnuncioData[]>;
  create(data: Omit<AnuncioData, 'id' | 'criadoEm'>): Promise<AnuncioData>;
  update(id: string, data: Partial<Omit<AnuncioData, 'id' | 'criadoEm' | 'lojaId'>>): Promise<AnuncioData | null>;
  delete(id: string): Promise<AnuncioData | null>;
}
