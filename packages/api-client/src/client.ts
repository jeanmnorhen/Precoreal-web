import type { 
  AuthResponse, 
  ProdutoResponse,
  CreateProdutoRequest,
  LojaResponse,
  CreateLojaRequest,
  UpdateLojaRequest,
  AnuncioResponse,
  AnuncioProximoResponse,
  CreateAnuncioRequest,
  UpdateAnuncioRequest,
  DashboardResponse,
  ScanResultRequest,
  ScanResultResponse,
  AdminDashboardResponse,
  PrecoMonitoramentoRequest,
  PrecoMonitoramentoResponse,
  UsoMonitoramentoRequest,
  UsoMonitoramentoResponse,
  TestExecutionResult,
  ObservabilidadeResponse,
  VerificarAcessoRequest,
  VerificarAcessoResponse,
  FuncionarioResponse,
  AddFuncionarioRequest,
  UpdateTurnosRequest,
  RenovarAnuncioResponse,
  LojaPublicResponse
} from '@precoreal/api-contracts';

const defaultApiBase = 'http://localhost:3001';

export interface ApiClientOptions {
  baseUrl?: string;
  getToken: () => string | null | Promise<string | null>;
}

export function createApiClient(options: ApiClientOptions) {
  const API_BASE = options.baseUrl || defaultApiBase;

  async function request<T>(
    path: string,
    reqOptions: RequestInit = {},
  ): Promise<T> {
    const token = await options.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((reqOptions.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...reqOptions,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Erro ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

    // Auth
    login: (email: string, senha: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),
    register: (nome: string, email: string, senha: string, tipo: string) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, tipo }),
      }),
    me: () => request<any>('/auth/me'),

    // Produtos
    produtos: {
      buscar: (busca?: string) =>
        request<ProdutoResponse[]>(`/produtos${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
      porCodigo: (codigo: string) =>
        request<ProdutoResponse>(`/produtos/codigo/${encodeURIComponent(codigo)}`),
      detalhe: (id: string) => request<ProdutoResponse>(`/produtos/${id}`),
      criar: (data: CreateProdutoRequest) => request<ProdutoResponse>('/produtos', { method: 'POST', body: JSON.stringify(data) }),
    },

    // Lojas
    lojas: {
      listar: () => request<LojaResponse[]>('/lojas'),
      criar: (data: CreateLojaRequest) => request<LojaResponse>('/lojas', { method: 'POST', body: JSON.stringify(data) }),
      detalhe: (id: string) => request<LojaResponse>(`/lojas/${id}`),
      atualizar: (id: string, data: UpdateLojaRequest) =>
        request<LojaResponse>(`/lojas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      publicProfile: (id: string) => request<LojaPublicResponse>(`/lojas/public/${id}`),
    },

    // Anúncios
    anuncios: {
      proximos: (lat: number, lng: number, tipo?: string) =>
        request<AnuncioProximoResponse[]>(
          `/anuncios/proximos?latitude=${lat}&longitude=${lng}${tipo ? `&tipo=${encodeURIComponent(tipo)}` : ''}`,
        ),
      listar: () => request<AnuncioResponse[]>('/anuncios'),
      criar: (data: CreateAnuncioRequest) => request<AnuncioResponse>('/anuncios', { method: 'POST', body: JSON.stringify(data) }),
      atualizar: (id: string, data: UpdateAnuncioRequest) =>
        request<AnuncioResponse>(`/anuncios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      deletar: (id: string) => request<AnuncioResponse>(`/anuncios/${id}`, { method: 'DELETE' }),
      renovar: (id: string) =>
        request<RenovarAnuncioResponse>(`/anuncios/${id}/renovar`, { method: 'POST' }),
    },

    // Lojista (portal)
    lojista: {
      dashboard: () => request<DashboardResponse>('/lojista/dashboard'),
      comprarCreditos: (valorCentavos: number, lojaId: string) =>
        request<any>('/lojista/creditos/comprar', {
          method: 'POST',
          body: JSON.stringify({ valorCentavos, lojaId }),
        }),
      funcionarios: {
        listar: (lojaId: string) =>
          request<FuncionarioResponse[]>(`/lojista/funcionarios?lojaId=${encodeURIComponent(lojaId)}`),
        adicionar: (data: AddFuncionarioRequest) =>
          request<FuncionarioResponse>('/lojista/funcionarios', {
            method: 'POST',
            body: JSON.stringify(data),
          }),
        atualizarTurnos: (id: string, data: UpdateTurnosRequest) =>
          request<FuncionarioResponse>(`/lojista/funcionarios/${id}/turnos`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          }),
        remover: (id: string) =>
          request<void>(`/lojista/funcionarios/${id}`, { method: 'DELETE' }),
      },
    },

    // Scanner
    scanner: {
      resultado: (data: ScanResultRequest) =>
        request<ScanResultResponse>('/scanner/resultado', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    // Admin
    admin: {
      dashboard: () => request<AdminDashboardResponse>('/admin/dashboard'),
      monitoramentoPrecos: (params?: PrecoMonitoramentoRequest) =>
        request<PrecoMonitoramentoResponse>(
          `/admin/precos${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`,
        ),
      monitoramentoUso: (params?: UsoMonitoramentoRequest) =>
        request<UsoMonitoramentoResponse>(
          `/admin/uso${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`,
        ),
      observabilidade: () =>
        request<ObservabilidadeResponse>('/admin/observabilidade'),
      testes: {
        executar: () =>
          request<TestExecutionResult>('/admin/testes/executar', { method: 'POST' }),
      },
    },

    // Funcionário
    funcionario: {
      lojas: () =>
        request<{ id: string; nome: string; enderecoCidade: string; enderecoEstado: string }[]>('/funcionario/lojas'),
      verificarAcesso: (lojaId: string, data: VerificarAcessoRequest) =>
        request<VerificarAcessoResponse>(`/funcionario/verificar-acesso/${lojaId}`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      produtos: {
        listar: (lojaId: string) =>
          request<ProdutoResponse[]>(`/funcionario/${lojaId}/produtos`),
      },
      anuncios: {
        listar: (lojaId: string) =>
          request<AnuncioResponse[]>(`/funcionario/${lojaId}/anuncios`),
      },
    },
  };
}
