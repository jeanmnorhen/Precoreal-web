export interface CreateAnuncioRequest {
  produtoId: string;
  titulo: string;
  descricao?: string;
  tipo?: 'oferta' | 'promocao' | 'promocao_relampago';
  raioAlcanceKm: number;
  custoCreditos: number;
  dataInicio: string;
  dataFim: string;
}

export interface UpdateAnuncioRequest {
  produtoId?: string;
  titulo?: string;
  descricao?: string;
  tipo?: 'oferta' | 'promocao' | 'promocao_relampago';
  raioAlcanceKm?: number;
  custoCreditos?: number;
  dataInicio?: string;
  dataFim?: string;
  status?: 'ativo' | 'pausado' | 'expirado';
}

export interface AnuncioResponse {
  id: string;
  lojaId: string;
  produtoId: string;
  titulo: string;
  descricao?: string;
  tipo: 'oferta' | 'promocao' | 'promocao_relampago';
  raioAlcanceKm: number;
  custoCreditos: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativo' | 'pausado' | 'expirado';
}

export interface AnuncioProximoResponse extends AnuncioResponse {
  distancia: number;
  lojaNome: string;
  lojaLatitude: number;
  lojaLongitude: number;
  precoMedio: number;
  codigoBarras: string;
  produtoNome: string;
}
