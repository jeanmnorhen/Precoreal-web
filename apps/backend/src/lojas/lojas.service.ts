import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { lojas, anuncios } from '@precoreal/shared';
import { eq, and, desc } from 'drizzle-orm';
import { CreateLojaDto } from './dto/create-loja.dto';
import { UpdateLojaDto } from './dto/update-loja.dto';

@Injectable()
export class LojasService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async create(usuarioId: string, dto: CreateLojaDto) {
    const localizacao = `SRID=4326;POINT(${dto.longitude} ${dto.latitude})`;

    const [loja] = await this.db
      .insert(lojas)
      .values({
        usuarioProprietarioId: usuarioId,
        nome: dto.nome,
        descricao: dto.descricao,
        enderecoRua: dto.enderecoRua,
        enderecoNumero: dto.enderecoNumero,
        enderecoBairro: dto.enderecoBairro,
        enderecoCidade: dto.enderecoCidade,
        enderecoEstado: dto.enderecoEstado,
        enderecoCep: dto.enderecoCep,
        localizacao,
        logoUrl: dto.logoUrl,
        tabloideUrl: dto.tabloideUrl,
      })
      .returning();

    return loja;
  }

  async findByProprietario(usuarioId: string) {
    return this.db
      .select()
      .from(lojas)
      .where(eq(lojas.usuarioProprietarioId, usuarioId));
  }

  async findById(id: string) {
    const [loja] = await this.db
      .select()
      .from(lojas)
      .where(eq(lojas.id, id))
      .limit(1);

    if (!loja) throw new NotFoundException('Loja não encontrada.');
    return loja;
  }

  async findPublicProfile(id: string) {
    const [loja] = await this.db
      .select()
      .from(lojas)
      .where(eq(lojas.id, id))
      .limit(1);

    if (!loja) throw new NotFoundException('Loja não encontrada.');

    const listaAnuncios = await this.db
      .select()
      .from(anuncios)
      .where(and(
        eq(anuncios.lojaId, id),
        eq(anuncios.status, 'ativo'),
      ))
      .orderBy(desc(anuncios.criadoEm));

    return { ...loja, anuncios: listaAnuncios };
  }

  async update(id: string, usuarioId: string, dto: UpdateLojaDto) {
    const { latitude, longitude, ...rest } = dto;

    const updateData: Record<string, unknown> = { ...rest };

    if (latitude && longitude) {
      updateData.localizacao = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    const [loja] = await this.db
      .update(lojas)
      .set(updateData)
      .where(and(eq(lojas.id, id), eq(lojas.usuarioProprietarioId, usuarioId)))
      .returning();

    if (!loja) throw new NotFoundException('Loja não encontrada.');
    return loja;
  }

  async delete(id: string, usuarioId: string) {
    const [loja] = await this.db
      .delete(lojas)
      .where(and(eq(lojas.id, id), eq(lojas.usuarioProprietarioId, usuarioId)))
      .returning();

    if (!loja) throw new NotFoundException('Loja não encontrada.');
    return loja;
  }
}
