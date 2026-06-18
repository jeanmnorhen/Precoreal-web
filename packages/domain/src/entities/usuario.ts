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

export class Usuario {
  constructor(public readonly data: UsuarioData) {}

  get id() { return this.data.id; }
  get nome() { return this.data.nome; }
  get email() { return this.data.email; }
  get senhaHash() { return this.data.senhaHash; }
  get tipo() { return this.data.tipo; }
  get saldoCreditos() { return this.data.saldoCreditos; }
  get quantidadeDiamantes() { return this.data.quantidadeDiamantes; }
  get criadoEm() { return this.data.criadoEm; }

  validarSaldoSuficiente(custo: number): ValidationError | null {
    return validarSaldoSuficiente(this.saldoCreditos, custo);
  }

  debitar(valor: number): UsuarioData {
    return { ...this.data, saldoCreditos: this.saldoCreditos - valor };
  }

  creditar(valor: number): UsuarioData {
    return { ...this.data, saldoCreditos: this.saldoCreditos + valor };
  }
}
