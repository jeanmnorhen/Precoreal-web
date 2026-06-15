export interface ProdutoData {
  id: string;
  codigoBarras: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  marca: string;
  precoMedio: number;
  listaImagens: string[];
  criadoEm: Date;
}
