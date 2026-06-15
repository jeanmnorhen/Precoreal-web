import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ScopedAnuncioRepository } from '../db/scoped-anuncio.repository';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { DatabaseService } from '../db/database.service';
import { LojasService } from '../lojas/lojas.service';
import { anuncios as anunciosTable, usuarios } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';

const REGRAS_TIPO = {
  oferta:            { maxDias: 15, custoMin: 1,  raioMaxKm: 3  },
  promocao:          { maxDias: 7,  custoMin: 3,  raioMaxKm: 5  },
  promocao_relampago: { maxDias: 3,  custoMin: 5,  raioMaxKm: 10 },
} as const;

@Injectable()
export class AnunciosService {
  constructor(
    private readonly anuncioRepo: ScopedAnuncioRepository,
    private readonly dbService: DatabaseService,
    private readonly lojasService: LojasService,
  ) {}

  private get db() {
    return this.dbService.database;
  }

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

  async renovar(id: string, usuarioId: string) {
    const [anuncio] = await this.db
      .select()
      .from(anunciosTable)
      .where(eq(anunciosTable.id, id))
      .limit(1);

    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');

    const minhasLojas = await this.lojasService.findByProprietario(usuarioId);
    const ehDono = minhasLojas.some((l) => l.id === anuncio.lojaId);
    if (!ehDono) throw new ForbiddenException('Este anúncio não pertence a uma loja sua.');

    const regra = REGRAS_TIPO[anuncio.tipo as keyof typeof REGRAS_TIPO];
    if (!regra) throw new BadRequestException(`Tipo de anúncio inválido: ${anuncio.tipo}`);

    const agora = new Date();
    const restanteMs = Math.max(0, anuncio.dataFim.getTime() - agora.getTime());
    const novoFim = new Date(agora.getTime() + restanteMs + regra.maxDias * 86400000);

    const [user] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, usuarioId))
      .limit(1);

    if (!user || user.saldoCreditos < anuncio.custoCreditos) {
      throw new BadRequestException(
        `Saldo insuficiente. Necessário: ${anuncio.custoCreditos} crédito(s). Saldo: ${user?.saldoCreditos || 0}`,
      );
    }

    await this.db
      .update(usuarios)
      .set({ saldoCreditos: sql`${usuarios.saldoCreditos} - ${anuncio.custoCreditos}` })
      .where(eq(usuarios.id, usuarioId));

    const [atualizado] = await this.db
      .update(anunciosTable)
      .set({ dataFim: novoFim })
      .where(eq(anunciosTable.id, id))
      .returning();

    const [userAtualizado] = await this.db
      .select({ saldoCreditos: usuarios.saldoCreditos })
      .from(usuarios)
      .where(eq(usuarios.id, usuarioId))
      .limit(1);

    return {
      anuncio: atualizado,
      creditosRestantes: userAtualizado?.saldoCreditos || 0,
    };
  }
}
