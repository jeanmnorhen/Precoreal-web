export interface AdminDashboardResponse {
  usuariosAtivos: number;
  totalOfertas: number;
  novasLojas: number;
}

export interface PrecoMonitoramentoRequest {
  produtoId?: string;
  regiao?: string;
  periodo?: '7d' | '30d' | '90d';
}

export interface PrecoMonitoramentoResponse {
  pontos: {
    data: string;
    precoMedio: number;
    regiao: string;
  }[];
}

export interface UsoMonitoramentoRequest {
  periodo?: '7d' | '30d' | '90d';
}

export interface UsoMonitoramentoResponse {
  volumeBuscas: { data: string; total: number }[];
  produtosMaisBuscados: { produtoId: string; nome: string; totalBuscas: number }[];
  engajamento: { data: string; usuariosAtivos: number }[];
}
