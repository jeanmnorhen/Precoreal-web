const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  // Auth
  login: (email: string, senha: string) =>
    request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),
  register: (nome: string, email: string, senha: string, tipo: string) =>
    request<{ user: any; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, tipo }),
    }),
  me: () => request<any>('/auth/me'),

  // Produtos
  produtos: {
    buscar: (busca?: string) =>
      request<any[]>(`/produtos${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
    porCodigo: (codigo: string) =>
      request<any>(`/produtos/codigo/${encodeURIComponent(codigo)}`),
    detalhe: (id: string) => request<any>(`/produtos/${id}`),
  },

  // Anúncios
  anuncios: {
    proximos: (lat: number, lng: number) =>
      request<any[]>(`/anuncios/proximos?latitude=${lat}&longitude=${lng}`),
  },

  // Scanner
  scanner: {
    resultado: (data: { codigoBarras: string; latitude?: number; longitude?: number }) =>
      request<any>('/scanner/resultado', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
