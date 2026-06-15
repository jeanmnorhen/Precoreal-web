import type { 
  AuthResponse, 
  ProdutoResponse,
  CreateProdutoRequest,
  LojaResponse,
  CreateLojaRequest,
  AnuncioResponse,
  AnuncioProximoResponse,
  CreateAnuncioRequest,
  UpdateAnuncioRequest,
  DashboardResponse,
  ScanResultRequest,
  ScanResultResponse
} from '@precoreal/api-contracts';

const defaultApiBase = 'http://localhost:3000';

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
    },

    // Anúncios
    anuncios: {
      proximos: (lat: number, lng: number) =>
        request<AnuncioProximoResponse[]>(`/anuncios/proximos?latitude=${lat}&longitude=${lng}`),
      listar: () => request<AnuncioResponse[]>('/anuncios'),
      criar: (data: CreateAnuncioRequest) => request<AnuncioResponse>('/anuncios', { method: 'POST', body: JSON.stringify(data) }),
      atualizar: (id: string, data: UpdateAnuncioRequest) =>
        request<AnuncioResponse>(`/anuncios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      deletar: (id: string) => request<AnuncioResponse>(`/anuncios/${id}`, { method: 'DELETE' }),
    },

    // Lojista (portal)
    lojista: {
      dashboard: () => request<DashboardResponse>('/lojista/dashboard'),
      comprarCreditos: (valorCentavos: number, lojaId: string) =>
        request<any>('/lojista/creditos/comprar', {
          method: 'POST',
          body: JSON.stringify({ valorCentavos, lojaId }),
        }),
    },

    // Scanner
    scanner: {
      resultado: (data: ScanResultRequest) =>
        request<ScanResultResponse>('/scanner/resultado', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },
  };
}
