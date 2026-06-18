import { Injectable, Inject } from '@nestjs/common';
import { ANUNCIO_REPOSITORY, validarRegrasAnuncio } from '@precoreal/domain';
import type { IAnuncioRepository, AnuncioData } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class AtualizarAnuncioUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute(input: {
    id: string;
    produtoId?: string;
    titulo?: string;
    descricao?: string;
    tipo?: string;
    raioAlcanceKm?: number;
    custoCreditos?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
  }) {
    const existente = await this.anuncioRepo.findById(input.id);
    if (!existente) throw new NotFoundError('Anúncio não encontrado.');

    const tipo = input.tipo || existente.tipo;
    const dataInicio = input.dataInicio ? new Date(input.dataInicio) : existente.dataInicio;
    const dataFim = input.dataFim ? new Date(input.dataFim) : existente.dataFim;
    const custoCreditos = input.custoCreditos ?? existente.custoCreditos;
    const raioAlcanceKm = input.raioAlcanceKm ?? existente.raioAlcanceKm;

    const erros = validarRegrasAnuncio({
      tipo,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      custoCreditos,
      raioAlcanceKm,
    });
    if (erros.length > 0) throw erros[0];

    const anuncio = await this.anuncioRepo.update(input.id, {
      ...(input.produtoId && { produtoId: input.produtoId }),
      ...(input.titulo && { titulo: input.titulo }),
      ...(input.descricao && { descricao: input.descricao }),
      ...(input.tipo && { tipo: input.tipo as AnuncioData['tipo'] }),
      ...(input.raioAlcanceKm && { raioAlcanceKm: input.raioAlcanceKm }),
      ...(input.custoCreditos && { custoCreditos: input.custoCreditos }),
      ...(input.dataInicio && { dataInicio: new Date(input.dataInicio) }),
      ...(input.dataFim && { dataFim: new Date(input.dataFim) }),
      ...(input.status && { status: input.status as AnuncioData['status'] }),
    });

    return anuncio;
  }
}
