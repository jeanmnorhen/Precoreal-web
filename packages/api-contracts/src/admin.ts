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

export interface HealthStatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  servicos: {
    bancoDeDados: { status: 'ok' | 'erro'; latencyMs: number; error?: string };
    redis: { status: 'ok' | 'erro'; latencyMs: number; error?: string };
    stripe: { status: 'ok' | 'erro' | 'nao_configurado'; latencyMs?: number; error?: string };
    storage: { status: 'ok' | 'nao_configurado' };
  };
}

export interface FilaStatus {
  nome: string;
  depth: number;
  ativos: number;
  aguardando: number;
  processados: number;
  falhos: number;
  processadosHoje: number;
  falhosHoje: number;
  tempoMedioProcessamentoMs: number;
}

export interface ErroRecente {
  id: string;
  mensagem: string;
  metodo: string;
  url: string;
  statusCode: number;
  ocorridoEm: string;
}

export interface ErrosRecentesResponse {
  erros: ErroRecente[];
  total: number;
}

export interface ObservabilidadeResponse {
  health: HealthStatusResponse;
  filas: FilaStatus[];
  erros: ErrosRecentesResponse;
}

export interface TestSuiteResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  numPassingTests: number;
  numFailingTests: number;
  failureMessage?: string;
}

export interface TestExecutionResult {
  unit: {
    numPassedSuites: number;
    numFailedSuites: number;
    numPassedTests: number;
    numFailedTests: number;
    suites: TestSuiteResult[];
    duration: number;
  };
  e2e: {
    numPassedSuites: number;
    numFailedSuites: number;
    numPassedTests: number;
    numFailedTests: number;
    suites: TestSuiteResult[];
    duration: number;
  };
  coverage: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  } | null;
}
