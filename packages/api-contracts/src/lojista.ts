export interface ComprarCreditosRequest {
  valorCentavos: number;
  lojaId: string;
}

export interface DashboardResponse {
  totalProdutos: number;
  totalAnunciosAtivos: number;
  visitasRecebidas: number; // ex de metrica
}
