import type { LojaData } from '../entities';

export const LOJA_REPOSITORY = Symbol('LOJA_REPOSITORY');

export interface ILojaRepository {
  findById(id: string): Promise<LojaData | null>;
  findByProprietario(usuarioId: string): Promise<LojaData[]>;
  findAll(): Promise<LojaData[]>;
  create(data: Omit<LojaData, 'id' | 'criadoEm'>): Promise<LojaData>;
  update(id: string, proprietarioId: string, data: Partial<Omit<LojaData, 'id' | 'criadoEm'>>): Promise<LojaData | null>;
  delete(id: string, proprietarioId: string): Promise<LojaData | null>;
}
