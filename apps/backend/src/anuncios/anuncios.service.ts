import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ScopedAnuncioRepository } from '../db/scoped-anuncio.repository';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';

const REGRAS_TIPO = {
  oferta:            { maxDias: 15, custoMin: 1,  raioMaxKm: 3  },
  promocao:          { maxDias: 7,  custoMin: 3,  raioMaxKm: 5  },
  promocao_relampago: { maxDias: 3,  custoMin: 5,  raioMaxKm: 10 },
} as const;

@Injectable()
export class AnunciosService {
  constructor(private readonly anuncioRepo: ScopedAnuncioRepository) {}

  private validarRegrasAnuncio(dados: {
    tipo: string;
    dataInicio: Date;
    dataFim: Date;
    custoCreditos: number;
    raioAlcanceKm: number;
  }) {
    const tipo = dados.tipo || 'oferta';
    const regra = REGRAS_TIPO[tipo as keyof typeof REGRAS_TIPO];
    if (!regra) throw new BadRequestException(`Tipo de anúncio inválido: ${tipo}`);

    const diffMs = dados.dataFim.getTime() - dados.dataInicio.getTime();
    const diffDias = diffMs / (1000 * 60 * 60 * 24);

    if (diffDias > regra.maxDias) {
      const nomeTipo = tipo === 'oferta' ? 'Oferta' : tipo === 'promocao' ? 'Promoção' : 'Promoção relâmpago';
      throw new BadRequestException(
        `${nomeTipo} tem validade máxima de ${regra.maxDias} dias (recebido: ${Math.ceil(diffDias)}d)`,
      );
    }

    if (dados.custoCreditos < regra.custoMin) {
      const nomeTipo = tipo === 'oferta' ? 'Oferta' : tipo === 'promocao' ? 'Promoção' : 'Promoção relâmpago';
      throw new BadRequestException(
        `${nomeTipo} requer no mínimo ${regra.custoMin} crédito(s) (recebido: ${dados.custoCreditos})`,
      );
    }

    if (dados.raioAlcanceKm > regra.raioMaxKm) {
      const nomeTipo = tipo === 'oferta' ? 'Oferta' : tipo === 'promocao' ? 'Promoção' : 'Promoção relâmpago';
      throw new BadRequestException(
        `${nomeTipo} tem raio máximo de ${regra.raioMaxKm}km (recebido: ${dados.raioAlcanceKm}km)`,
      );
    }
  }

  async create(dto: CreateAnuncioDto) {
    const tipo = dto.tipo || 'oferta';
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    this.validarRegrasAnuncio({
      tipo,
      dataInicio,
      dataFim,
      custoCreditos: dto.custoCreditos,
      raioAlcanceKm: dto.raioAlcanceKm,
    });

    return this.anuncioRepo.create({
      produtoId: dto.produtoId,
      titulo: dto.titulo,
      descricao: dto.descricao,
      tipo,
      raioAlcanceKm: dto.raioAlcanceKm,
      custoCreditos: dto.custoCreditos,
      dataInicio,
      dataFim,
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
    const existente = await this.anuncioRepo.findById(id);
    if (!existente) throw new NotFoundException('Anúncio não encontrado.');

    const tipo = dto.tipo || existente.tipo;
    const dataInicio = dto.dataInicio ? new Date(dto.dataInicio) : existente.dataInicio;
    const dataFim = dto.dataFim ? new Date(dto.dataFim) : existente.dataFim;
    const custoCreditos = dto.custoCreditos ?? existente.custoCreditos;
    const raioAlcanceKm = dto.raioAlcanceKm ?? existente.raioAlcanceKm;

    this.validarRegrasAnuncio({
      tipo,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      custoCreditos,
      raioAlcanceKm,
    });

    const anuncio = await this.anuncioRepo.update(id, {
      ...(dto.produtoId && { produtoId: dto.produtoId }),
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.descricao && { descricao: dto.descricao }),
      ...(dto.tipo && { tipo: dto.tipo }),
      ...(dto.raioAlcanceKm && { raioAlcanceKm: dto.raioAlcanceKm }),
      ...(dto.custoCreditos && { custoCreditos: dto.custoCreditos }),
      ...(dto.dataInicio && { dataInicio: new Date(dto.dataInicio) }),
      ...(dto.dataFim && { dataFim: new Date(dto.dataFim) }),
      ...(dto.status && { status: dto.status }),
    });

    return anuncio;
  }

  async delete(id: string) {
    const anuncio = await this.anuncioRepo.delete(id);
    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');
    return anuncio;
  }
}
