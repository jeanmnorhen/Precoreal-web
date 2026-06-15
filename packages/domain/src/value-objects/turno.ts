import { ValidationError } from '../errors';

export interface TurnoData {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
}

export class Turno {
  private constructor(public readonly props: TurnoData) {}

  static create(dados: TurnoData): Turno {
    const erros = Turno.validar(dados);
    if (erros.length > 0) throw erros[0];
    return new Turno(dados);
  }

  static validar(dados: TurnoData): ValidationError[] {
    const erros: ValidationError[] = [];
    if (dados.diaSemana < 0 || dados.diaSemana > 6) {
      erros.push(new ValidationError('Dia da semana deve ser 0-6', 'diaSemana'));
    }
    if (!/^\d{2}:\d{2}$/.test(dados.horaInicio)) {
      erros.push(new ValidationError('horaInicio deve ter formato HH:mm', 'horaInicio'));
    }
    if (!/^\d{2}:\d{2}$/.test(dados.horaFim)) {
      erros.push(new ValidationError('horaFim deve ter formato HH:mm', 'horaFim'));
    }
    if (erros.length === 0 && dados.horaInicio >= dados.horaFim) {
      erros.push(new ValidationError('horaInicio deve ser anterior a horaFim', 'horaFim'));
    }
    return erros;
  }

  get diaSemana() { return this.props.diaSemana; }
  get horaInicio() { return this.props.horaInicio; }
  get horaFim() { return this.props.horaFim; }

  estaNoHorario(data: Date): boolean {
    const hora = `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
    return data.getDay() === this.diaSemana && hora >= this.horaInicio && hora <= this.horaFim;
  }
}
