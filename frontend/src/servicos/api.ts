const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ItemCarrinho {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  nome?: string; // para exibição local
}

export interface DadosAnuncio {
  anuncio_id: string;
  loja_id: string;
  produto_id: string;
  titulo: string;
  descricao: string;
  raio_alcance: number;
  data_inicio: string;
  data_fim: string;
  usuario_proprietario_id: string;
}

export async function obterStatus() {
  const res = await fetch(`${BASE_URL}/sistema/status`);
  if (!res.ok) throw new Error("Erro ao obter status do servidor");
  return res.json();
}

export async function semearBanco() {
  const res = await fetch(`${BASE_URL}/sistema/semear`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erro ao semear banco de dados");
  return res.json();
}

export async function obterFeed(lat: number, lon: number) {
  const res = await fetch(`${BASE_URL}/consumidor/feed?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Erro ao carregar o feed de ofertas");
  return res.json();
}

export async function compararPrecos(busca: string) {
  const res = await fetch(`${BASE_URL}/consumidor/comparar?busca=${encodeURIComponent(busca)}`);
  if (!res.ok) throw new Error("Erro ao comparar preços");
  return res.json();
}

export async function identificarProduto(codigo: string) {
  const res = await fetch(`${BASE_URL}/consumidor/compra-ao-vivo/identificar?codigo=${encodeURIComponent(codigo)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Erro ao identificar produto");
  }
  return res.json();
}

export async function calcularTotalCarrinho(itens: ItemCarrinho[]) {
  const res = await fetch(`${BASE_URL}/consumidor/compra-ao-vivo/total`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itens }),
  });
  if (!res.ok) throw new Error("Erro ao calcular total do carrinho");
  return res.json();
}

export async function impulsionarAnuncio(dados: DadosAnuncio) {
  const res = await fetch(`${BASE_URL}/lojista/anuncios/impulsionar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.detail || "Erro ao criar anúncio");
  }
  return res.json();
}

export async function adquirirCreditos(usuarioId: string, quantidadeCreditos: number, valorPago: number) {
  const res = await fetch(`${BASE_URL}/lojista/creditos/adquirir`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario_id: usuarioId,
      quantidade_creditos: quantidadeCreditos,
      valor_pago: valorPago,
    }),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.detail || "Erro ao adquirir créditos");
  }
  return res.json();
}
