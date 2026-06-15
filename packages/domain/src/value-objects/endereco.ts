import { ValidationError } from '../errors';

export interface EnderecoData {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export class Endereco {
  private constructor(public readonly props: EnderecoData) {}

  static create(dados: EnderecoData): Endereco {
    const erros = Endereco.validar(dados);
    if (erros.length > 0) throw erros[0];
    return new Endereco(dados);
  }

  static validar(dados: EnderecoData): ValidationError[] {
    const erros: ValidationError[] = [];
    if (!dados.rua?.trim()) erros.push(new ValidationError('Rua é obrigatória', 'rua'));
    if (!dados.numero?.trim()) erros.push(new ValidationError('Número é obrigatório', 'numero'));
    if (!dados.bairro?.trim()) erros.push(new ValidationError('Bairro é obrigatório', 'bairro'));
    if (!dados.cidade?.trim()) erros.push(new ValidationError('Cidade é obrigatória', 'cidade'));
    if (!dados.estado?.trim() || dados.estado.length !== 2) erros.push(new ValidationError('Estado deve ter 2 caracteres', 'estado'));
    if (!dados.cep?.trim() || dados.cep.length !== 8) erros.push(new ValidationError('CEP deve ter 8 dígitos', 'cep'));
    return erros;
  }

  get rua() { return this.props.rua; }
  get numero() { return this.props.numero; }
  get bairro() { return this.props.bairro; }
  get cidade() { return this.props.cidade; }
  get estado() { return this.props.estado; }
  get cep() { return this.props.cep; }
}
