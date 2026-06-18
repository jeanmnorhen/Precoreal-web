import { Turno, type TurnoData } from '../value-objects/turno';

export interface FuncionarioLojaData {
  id: string;
  usuarioId: string;
  lojaId: string;
  turnos: string[] | null;
  criadoEm: Date;
}

export class FuncionarioLoja {
  public readonly turnos: Turno[];

  constructor(public readonly data: FuncionarioLojaData) {
    this.turnos = (data.turnos || []).map((t) => {
      const raw: TurnoData = typeof t === 'string' ? JSON.parse(t) : t;
      return Turno.create(raw);
    });
  }

  get id() { return this.data.id; }
  get usuarioId() { return this.data.usuarioId; }
  get lojaId() { return this.data.lojaId; }
  get criadoEm() { return this.data.criadoEm; }

  estaNoHorario(agora: Date): boolean {
    return this.turnos.some((t) => t.estaNoHorario(agora));
  }
}
