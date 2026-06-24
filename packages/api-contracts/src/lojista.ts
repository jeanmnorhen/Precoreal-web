export interface ComprarCreditosRequest {
  valorCentavos: number;
  lojaId: string;
}

export interface DashboardResponse {
  totalLojas: number;
  totalAnuncios: number;
  totalAnunciosAtivos: number;
  creditosGratis: {
    recebidosEsteMes: boolean;
    proximaConcessao: string;
    expiraEm: string | null;
  };
}

export interface Turno {
  diaSemana: number; // 0=domingo, 1=segunda, ..., 6=sábado
  horaInicio: string; // "08:00"
  horaFim: string; // "18:00"
}

export interface FuncionarioResponse {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  lojaId: string;
  turnos: Turno[];
  criadoEm: string;
}

export interface AddFuncionarioRequest {
  email: string;
  lojaId: string;
  turnos: Turno[];
}

export interface UpdateTurnosRequest {
  turnos: Turno[];
}
