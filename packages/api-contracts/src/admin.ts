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
