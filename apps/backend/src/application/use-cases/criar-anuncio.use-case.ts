import { Injectable, Inject } from '@nestjs/common';
import { ANUNCIO_REPOSITORY, validarRegrasAnuncio } from '@precoreal/domain';
import type { IAnuncioRepository, AnuncioData } from '@precoreal/domain';
import { ValidationError } from '@precoreal/domain';

@Injectable()
export class CriarAnuncioUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  async execute(input: {
    lojaId: string;
    produtoId: string;
    titulo: string;
    descricao?: string;
    tipo?: string;
    raioAlcanceKm: number;
    custoCreditos: number;
    dataInicio: string;
    dataFim: string;
  }) {
    const tipo = input.tipo || 'oferta';
    const dataInicio = new Date(input.dataInicio);
    const dataFim = new Date(input.dataFim);

    const erros = validarRegrasAnuncio({ tipo, dataInicio, dataFim, custoCreditos: input.custoCreditos, raioAlcanceKm: input.raioAlcanceKm });
    if (erros.length > 0) throw erros[0];

    return this.anuncioRepo.create({
      lojaId: input.lojaId || '',
      produtoId: input.produtoId,
      titulo: input.titulo,
      descricao: input.descricao || null,
      tipo: tipo as AnuncioData['tipo'],
      raioAlcanceKm: input.raioAlcanceKm,
      custoCreditos: input.custoCreditos,
      dataInicio,
      dataFim,
      status: 'ativo',
    });
  }
}
