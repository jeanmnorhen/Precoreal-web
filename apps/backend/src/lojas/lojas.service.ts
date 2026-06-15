import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOJA_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IAnuncioRepository, LojaData } from '@precoreal/domain';
import { CreateLojaDto } from './dto/create-loja.dto';
import { UpdateLojaDto } from './dto/update-loja.dto';

@Injectable()
export class LojasService {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepository: IAnuncioRepository,
  ) {}

  async create(usuarioId: string, dto: CreateLojaDto) {
    const localizacao = `SRID=4326;POINT(${dto.longitude} ${dto.latitude})`;

    const loja = await this.lojaRepository.create({
      usuarioProprietarioId: usuarioId,
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      enderecoRua: dto.enderecoRua,
      enderecoNumero: dto.enderecoNumero,
      enderecoBairro: dto.enderecoBairro,
      enderecoCidade: dto.enderecoCidade,
      enderecoEstado: dto.enderecoEstado,
      enderecoCep: dto.enderecoCep,
      localizacao,
      perimetro: null,
      perimetroRaioMetros: 300,
      logoUrl: dto.logoUrl ?? null,
      tabloideUrl: dto.tabloideUrl ?? null,
    });

    return loja;
  }

  async findByProprietario(usuarioId: string): Promise<LojaData[]> {
    return this.lojaRepository.findByProprietario(usuarioId);
  }

  async findById(id: string): Promise<LojaData> {
    const loja = await this.lojaRepository.findById(id);
    if (!loja) throw new NotFoundException('Loja não encontrada.');
    return loja;
  }

  async findPublicProfile(id: string) {
    const loja = await this.lojaRepository.findById(id);
    if (!loja) throw new NotFoundException('Loja não encontrada.');

    const anuncios = await this.anuncioRepository.findAll({ lojaId: id, status: 'ativo' });
    anuncios.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return { ...loja, anuncios };
  }

  async update(id: string, usuarioId: string, dto: UpdateLojaDto) {
    const { latitude, longitude, ...rest } = dto;

    const updateData: Record<string, unknown> = { ...rest };

    if (latitude && longitude) {
      updateData.localizacao = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    const loja = await this.lojaRepository.update(id, usuarioId, updateData as any);
    if (!loja) throw new NotFoundException('Loja não encontrada.');
    return loja;
  }

  async delete(id: string, usuarioId: string) {
    const loja = await this.lojaRepository.delete(id, usuarioId);
    if (!loja) throw new NotFoundException('Loja não encontrada.');
    return loja;
  }
}
