export interface CreateProdutoRequest {
  codigoBarras: string;
  nome: string;
  descricao?: string;
  categoria: string;
  marca: string;
  precoMedio?: number;
  listaImagens?: string[];
}

export interface UpdateProdutoRequest {
  codigoBarras?: string;
  nome?: string;
  descricao?: string;
  categoria?: string;
  marca?: string;
  precoMedio?: number;
  listaImagens?: string[];
}

export interface ProdutoResponse {
  id: string;
  codigoBarras: string;
  nome: string;
  descricao?: string;
  categoria: string;
  marca: string;
  precoMedio: number;
  listaImagens: string[];
}
