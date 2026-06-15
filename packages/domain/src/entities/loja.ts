export interface LojaData {
  id: string;
  usuarioProprietarioId: string;
  nome: string;
  descricao: string | null;
  enderecoRua: string;
  enderecoNumero: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoEstado: string;
  enderecoCep: string;
  localizacao: string;
  perimetro: string | null;
  perimetroRaioMetros: number;
  logoUrl: string | null;
  tabloideUrl: string | null;
  criadoEm: Date;
}

export interface LojaComAnuncios extends LojaData {
  anuncios: import('./anuncio').AnuncioData[];
}
