import type { FuncionarioLojaData } from '../entities';

export const FUNCIONARIO_LOJA_REPOSITORY = Symbol('FUNCIONARIO_LOJA_REPOSITORY');

export interface IFuncionarioLojaRepository {
  findById(id: string): Promise<FuncionarioLojaData | null>;
  findByLojaId(lojaId: string): Promise<FuncionarioLojaData[]>;
  findVinculo(usuarioId: string, lojaId: string): Promise<FuncionarioLojaData | null>;
  create(data: Omit<FuncionarioLojaData, 'id' | 'criadoEm'>): Promise<FuncionarioLojaData>;
  update(id: string, data: Partial<Omit<FuncionarioLojaData, 'id'>>): Promise<FuncionarioLojaData | null>;
  delete(id: string): Promise<FuncionarioLojaData | null>;
}
