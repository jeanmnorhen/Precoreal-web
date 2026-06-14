"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
function getToken() {
    if (typeof window === 'undefined')
        return null;
    return localStorage.getItem('token');
}
async function request(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
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
exports.api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
    // Auth
    login: (email, senha) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
    }),
    register: (nome, email, senha, tipo) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, tipo }),
    }),
    me: () => request('/auth/me'),
    // Produtos
    produtos: {
        buscar: (busca) => request(`/produtos${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
        porCodigo: (codigo) => request(`/produtos/codigo/${encodeURIComponent(codigo)}`),
        detalhe: (id) => request(`/produtos/${id}`),
        criar: (data) => request('/produtos', { method: 'POST', body: JSON.stringify(data) }),
    },
    // Lojas
    lojas: {
        listar: () => request('/lojas'),
        criar: (data) => request('/lojas', { method: 'POST', body: JSON.stringify(data) }),
        detalhe: (id) => request(`/lojas/${id}`),
    },
    // Anúncios
    anuncios: {
        proximos: (lat, lng) => request(`/anuncios/proximos?latitude=${lat}&longitude=${lng}`),
        listar: () => request('/anuncios'),
        criar: (data) => request('/anuncios', { method: 'POST', body: JSON.stringify(data) }),
        atualizar: (id, data) => request(`/anuncios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        deletar: (id) => request(`/anuncios/${id}`, { method: 'DELETE' }),
    },
    // Lojista (portal)
    lojista: {
        dashboard: () => request('/lojista/dashboard'),
        comprarCreditos: (valorCentavos, lojaId) => request('/lojista/creditos/comprar', {
            method: 'POST',
            body: JSON.stringify({ valorCentavos, lojaId }),
        }),
    },
    // Scanner
    scanner: {
        resultado: (data) => request('/scanner/resultado', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
};
