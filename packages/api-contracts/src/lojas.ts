export interface CreateLojaRequest {
  nome: string;
  descricao?: string;
  enderecoRua: string;
  enderecoNumero: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoEstado: string;
  enderecoCep: string;
  latitude: string;
  longitude: string;
}

export interface UpdateLojaRequest {
  nome?: string;
  descricao?: string;
  enderecoRua?: string;
  enderecoNumero?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  latitude?: string;
  longitude?: string;
}

export interface LojaResponse {
  id: string;
  usuarioProprietarioId: string;
  nome: string;
  descricao?: string;
  enderecoRua: string;
  enderecoNumero: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoEstado: string;
  enderecoCep: string;
  localizacao: string; // representacao no postgis ou geojson
  tabloideUrl?: string;
}
