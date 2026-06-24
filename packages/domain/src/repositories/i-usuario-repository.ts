import type { UsuarioData } from '../entities';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface RegistroUsuarioPorDia {
  data: string;
  total: number;
}

export interface IUsuarioRepository {
  findById(id: string): Promise<UsuarioData | null>;
  findByEmail(email: string): Promise<UsuarioData | null>;
  findAllByTipo(tipo: string): Promise<UsuarioData[]>;
  create(data: Omit<UsuarioData, 'id' | 'criadoEm'>): Promise<UsuarioData>;
  update(id: string, data: Partial<Omit<UsuarioData, 'id' | 'criadoEm'>>): Promise<UsuarioData | null>;
  debitarCreditos(id: string, valor: number): Promise<number>;
  creditarCreditos(id: string, valor: number): Promise<number>;
  countByDateRange(desde: Date): Promise<number>;
  getRegistrationsByDay(desde: Date): Promise<RegistroUsuarioPorDia[]>;
}
