import { ValidationError } from '../errors';

export type TipoUsuario = 'consumidor' | 'lojista' | 'funcionario' | 'admin';

export interface UsuarioData {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  tipo: TipoUsuario;
  saldoCreditos: number;
  quantidadeDiamantes: number;
  criadoEm: Date;
}

export function validarSaldoSuficiente(saldo: number, custo: number): ValidationError | null {
  if (saldo < custo) {
    return new ValidationError(
      `Saldo insuficiente. Necessário: ${custo} crédito(s). Saldo: ${saldo}`,
      'saldoCreditos',
    );
  }
  return null;
}
