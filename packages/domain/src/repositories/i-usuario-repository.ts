import type { UsuarioData } from '../entities';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface IUsuarioRepository {
  findById(id: string): Promise<UsuarioData | null>;
  findByEmail(email: string): Promise<UsuarioData | null>;
  create(data: Omit<UsuarioData, 'id' | 'criadoEm'>): Promise<UsuarioData>;
  debitarCreditos(id: string, valor: number): Promise<number>;
}
