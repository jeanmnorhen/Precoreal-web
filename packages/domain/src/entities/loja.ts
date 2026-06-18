import { Endereco, type EnderecoData } from '../value-objects/endereco';
import { Geolocalizacao } from '../value-objects/geolocalizacao';

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

export class Loja {
  public readonly endereco: Endereco;
  public readonly geolocalizacao: Geolocalizacao;

  constructor(public readonly data: LojaData) {
    this.endereco = Endereco.create({
      rua: data.enderecoRua,
      numero: data.enderecoNumero,
      bairro: data.enderecoBairro,
      cidade: data.enderecoCidade,
      estado: data.enderecoEstado,
      cep: data.enderecoCep,
    });
    this.geolocalizacao = Geolocalizacao.fromWKT(data.localizacao);
  }

  get id() { return this.data.id; }
  get usuarioProprietarioId() { return this.data.usuarioProprietarioId; }
  get nome() { return this.data.nome; }
  get descricao() { return this.data.descricao; }
  get perimetro() { return this.data.perimetro; }
  get perimetroRaioMetros() { return this.data.perimetroRaioMetros; }
  get logoUrl() { return this.data.logoUrl; }
  get tabloideUrl() { return this.data.tabloideUrl; }
  get criadoEm() { return this.data.criadoEm; }
}
