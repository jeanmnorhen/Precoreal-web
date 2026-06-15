export interface ScanResultRequest {
  codigoBarras: string;
  latitude?: number;
  longitude?: number;
}

export interface ScanResultResponse {
  produto: any; // ProdutoResponse
  ofertasProximas: any[]; // AnuncioProximoResponse[]
}
