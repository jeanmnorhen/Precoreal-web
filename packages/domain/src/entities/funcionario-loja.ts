export interface FuncionarioLojaData {
  id: string;
  usuarioId: string;
  lojaId: string;
  turnos: string[] | null;
  criadoEm: Date;
}
