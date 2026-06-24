export interface CosmosProdutoSugerido {
  codigoBarras: string;
  nome: string;
  marca: string;
  categoria: string;
  ncm?: string;
  precoMedio?: number;
  imagemUrl?: string;
}

export interface CosmosBuscaRequest {
  termo: string;
}

export interface CosmosBuscaResponse {
  produtos: CosmosProdutoSugerido[];
}

export interface CosmosQuotaResponse {
  data: string;
  consultasUtilizadas: number;
  limiteDiario: number;
  disponiveis: number;
}
