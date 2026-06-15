export interface VerificarAcessoRequest {
  latitude: number;
  longitude: number;
}

export interface VerificarAcessoResponse {
  acessoPermitido: boolean;
  mensagem: string;
  lojaId: string;
  lojaNome: string;
  dentoPerimetro: boolean;
  horarioValido: boolean;
}
