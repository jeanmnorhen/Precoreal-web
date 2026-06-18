import { ValidationError } from '../errors';

export type TipoAnuncio = 'oferta' | 'promocao' | 'promocao_relampago';
export type StatusAnuncio = 'ativo' | 'pausado' | 'expirado';

export interface AnuncioData {
  id: string;
  lojaId: string;
  produtoId: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoAnuncio;
  raioAlcanceKm: number;
  custoCreditos: number;
  dataInicio: Date;
  dataFim: Date;
  status: StatusAnuncio;
  criadoEm: Date;
}

export const REGRAS_TIPO: Record<TipoAnuncio, { maxDias: number; custoMin: number; raioMaxKm: number }> = {
  oferta: { maxDias: 15, custoMin: 1, raioMaxKm: 3 },
  promocao: { maxDias: 7, custoMin: 3, raioMaxKm: 5 },
  promocao_relampago: { maxDias: 3, custoMin: 5, raioMaxKm: 10 },
};

const NOME_TIPO: Record<TipoAnuncio, string> = {
  oferta: 'Oferta',
  promocao: 'Promoção',
  promocao_relampago: 'Promoção relâmpago',
};

export function validarRegrasAnuncio(dados: {
  tipo: string;
  dataInicio: Date;
  dataFim: Date;
  custoCreditos: number;
  raioAlcanceKm: number;
}): ValidationError[] {
  const erros: ValidationError[] = [];
  const tipo = dados.tipo || 'oferta';
  const regra = REGRAS_TIPO[tipo as TipoAnuncio];

  if (!regra) {
    erros.push(new ValidationError(`Tipo de anúncio inválido: ${tipo}`, 'tipo'));
    return erros;
  }

  const diffMs = dados.dataFim.getTime() - dados.dataInicio.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);

  if (diffDias > regra.maxDias) {
    erros.push(new ValidationError(
      `${NOME_TIPO[tipo as TipoAnuncio]} tem validade máxima de ${regra.maxDias} dias (recebido: ${Math.ceil(diffDias)}d)`,
      'dataFim',
    ));
  }

  if (dados.custoCreditos < regra.custoMin) {
    erros.push(new ValidationError(
      `${NOME_TIPO[tipo as TipoAnuncio]} requer no mínimo ${regra.custoMin} crédito(s) (recebido: ${dados.custoCreditos})`,
      'custoCreditos',
    ));
  }

  if (dados.raioAlcanceKm > regra.raioMaxKm) {
    erros.push(new ValidationError(
      `${NOME_TIPO[tipo as TipoAnuncio]} tem raio máximo de ${regra.raioMaxKm}km (recebido: ${dados.raioAlcanceKm}km)`,
      'raioAlcanceKm',
    ));
  }

  return erros;
}

export function calcularNovaDataFim(anuncio: {
  tipo: TipoAnuncio;
  dataInicio: Date;
  dataFim: Date;
}): Date {
  const regra = REGRAS_TIPO[anuncio.tipo];
  const agora = new Date();
  const restanteMs = Math.max(0, anuncio.dataFim.getTime() - agora.getTime());
  return new Date(agora.getTime() + restanteMs + regra.maxDias * 86400000);
}

export class Anuncio {
  constructor(public readonly data: AnuncioData) {}

  get id() { return this.data.id; }
  get lojaId() { return this.data.lojaId; }
  get produtoId() { return this.data.produtoId; }
  get titulo() { return this.data.titulo; }
  get descricao() { return this.data.descricao; }
  get tipo() { return this.data.tipo; }
  get raioAlcanceKm() { return this.data.raioAlcanceKm; }
  get custoCreditos() { return this.data.custoCreditos; }
  get dataInicio() { return this.data.dataInicio; }
  get dataFim() { return this.data.dataFim; }
  get status() { return this.data.status; }
  get criadoEm() { return this.data.criadoEm; }

  validarRegras(): ValidationError[] {
    return validarRegrasAnuncio({
      tipo: this.tipo,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      custoCreditos: this.custoCreditos,
      raioAlcanceKm: this.raioAlcanceKm,
    });
  }

  calcularNovaDataFim(): Date {
    return calcularNovaDataFim(this.data);
  }
}
