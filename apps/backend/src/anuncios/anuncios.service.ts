import { Injectable, NotFoundException } from '@nestjs/common';
import { ScopedAnuncioRepository } from '../db/scoped-anuncio.repository';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';

@Injectable()
export class AnunciosService {
  constructor(private readonly anuncioRepo: ScopedAnuncioRepository) {}

  async create(dto: CreateAnuncioDto) {
    return this.anuncioRepo.create({
      produtoId: dto.produtoId,
      titulo: dto.titulo,
      descricao: dto.descricao,
      raioAlcanceKm: dto.raioAlcanceKm,
      custoCreditos: dto.custoCreditos,
      dataInicio: new Date(dto.dataInicio),
      dataFim: new Date(dto.dataFim),
    });
  }

  async findAll() {
    return this.anuncioRepo.findAll();
  }

  async findById(id: string) {
    const anuncio = await this.anuncioRepo.findById(id);
    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');
    return anuncio;
  }

  async update(id: string, dto: UpdateAnuncioDto) {
    const anuncio = await this.anuncioRepo.update(id, {
      ...(dto.produtoId && { produtoId: dto.produtoId }),
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.descricao && { descricao: dto.descricao }),
      ...(dto.raioAlcanceKm && { raioAlcanceKm: dto.raioAlcanceKm }),
      ...(dto.custoCreditos && { custoCreditos: dto.custoCreditos }),
      ...(dto.dataInicio && { dataInicio: new Date(dto.dataInicio) }),
      ...(dto.dataFim && { dataFim: new Date(dto.dataFim) }),
      ...(dto.status && { status: dto.status }),
    });

    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');
    return anuncio;
  }

  async delete(id: string) {
    const anuncio = await this.anuncioRepo.delete(id);
    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');
    return anuncio;
  }
}
