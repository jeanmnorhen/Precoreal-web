import { Injectable, Scope } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { TenantContext } from '../../tenant/tenant-context';
import { anuncios, lojas, produtos } from '@precoreal/shared';
import { eq, and, sql, gte, desc } from 'drizzle-orm';
import type { IAnuncioRepository, AnuncioStats, NearbyAdResult, TopProdutoData } from '@precoreal/domain';
import type { AnuncioData, TipoAnuncio, StatusAnuncio } from '@precoreal/domain';

@Injectable({ scope: Scope.REQUEST })
export class DrizzleAnuncioRepository implements IAnuncioRepository {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly tenantContext: TenantContext,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  private get tenantId() {
    return this.tenantContext.tenantId;
  }

  async findById(id: string): Promise<AnuncioData | null> {
    const rows = await this.db
      .select()
      .from(anuncios)
      .where(and(eq(anuncios.id, id), eq(anuncios.lojaId, this.tenantId)))
      .limit(1);
    return (rows[0] as AnuncioData) || null;
  }

  async findAll(params?: { lojaId?: string; status?: StatusAnuncio; tipo?: TipoAnuncio }): Promise<AnuncioData[]> {
    const conditions = [eq(anuncios.lojaId, params?.lojaId || this.tenantId)];
    if (params?.status) conditions.push(eq(anuncios.status, params.status));
    if (params?.tipo) conditions.push(eq(anuncios.tipo, params.tipo));
    const rows = await this.db.select().from(anuncios).where(and(...conditions));
    return rows as AnuncioData[];
  }

  async countByLojaIds(lojaIds: string[]): Promise<AnuncioStats> {
    if (lojaIds.length === 0) return { total: 0, ativos: 0 };
    const [row] = await this.db
      .select({
        total: sql<number>`count(*)`,
        ativos: sql<number>`count(*) filter (where ${anuncios.status} = 'ativo')`,
      })
      .from(anuncios)
      .where(sql`${anuncios.lojaId} = any(${lojaIds}::uuid[])`);
    return {
      total: Number(row?.total || 0),
      ativos: Number(row?.ativos || 0),
    };
  }

  async countAll(): Promise<number> {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(anuncios);
    return Number(row?.total || 0);
  }

  async findProximos(latitude: number, longitude: number, tipo?: string, limit = 50): Promise<NearbyAdResult[]> {
    const results = await this.db
      .select({
        id: anuncios.id,
        titulo: anuncios.titulo,
        tipo: anuncios.tipo,
        distancia: sql<number>`ST_Distance(${lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography) / 1000`,
        lojaNome: lojas.nome,
        lojaLatitude: sql<number>`ST_Y(${lojas.localizacao}::geometry)`,
        lojaLongitude: sql<number>`ST_X(${lojas.localizacao}::geometry)`,
        produtoNome: produtos.nome,
        codigoBarras: produtos.codigoBarras,
        precoMedio: produtos.precoMedio,
      })
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(
        and(
          eq(anuncios.status, 'ativo'),
          tipo ? eq(anuncios.tipo, tipo as any) : sql`1=1`,
          sql`ST_DWithin(${lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography, ${anuncios.raioAlcanceKm} * 1000)`,
        ),
      )
      .limit(limit);
    return results.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      distancia: parseFloat(r.distancia.toFixed(3)),
      lojaNome: r.lojaNome,
      lojaLatitude: r.lojaLatitude,
      lojaLongitude: r.lojaLongitude,
      produtoNome: r.produtoNome,
      codigoBarras: r.codigoBarras,
      precoMedio: r.precoMedio,
    }));
  }

  async findAtivosComDetalhes(limit: number): Promise<NearbyAdResult[]> {
    const results = await this.db
      .select({
        id: anuncios.id,
        titulo: anuncios.titulo,
        tipo: anuncios.tipo,
        distancia: sql<number>`0`,
        lojaNome: lojas.nome,
        lojaLatitude: sql<number>`ST_Y(${lojas.localizacao}::geometry)`,
        lojaLongitude: sql<number>`ST_X(${lojas.localizacao}::geometry)`,
        produtoNome: produtos.nome,
        codigoBarras: produtos.codigoBarras,
        precoMedio: produtos.precoMedio,
      })
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(eq(anuncios.status, 'ativo'))
      .limit(limit);
    return results.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      distancia: 999,
      lojaNome: r.lojaNome,
      lojaLatitude: r.lojaLatitude,
      lojaLongitude: r.lojaLongitude,
      produtoNome: r.produtoNome,
      codigoBarras: r.codigoBarras,
      precoMedio: r.precoMedio,
    }));
  }

  async getTopProdutos(desde: Date, limit: number): Promise<TopProdutoData[]> {
    const rows = await this.db
      .select({
        produtoId: produtos.id,
        nome: produtos.nome,
        totalBuscas: sql<number>`count(*)`,
      })
      .from(anuncios)
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(gte(anuncios.criadoEm, desde))
      .groupBy(produtos.id, produtos.nome)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
    return rows.map((r) => ({
      produtoId: r.produtoId,
      nome: r.nome,
      totalBuscas: Number(r.totalBuscas),
    }));
  }

  async create(data: Omit<AnuncioData, 'id' | 'criadoEm'>): Promise<AnuncioData> {
    const rows = await this.db
      .insert(anuncios)
      .values({ ...data, lojaId: this.tenantId } as any)
      .returning();
    return rows[0] as AnuncioData;
  }

  async update(id: string, data: Partial<Omit<AnuncioData, 'id' | 'criadoEm' | 'lojaId'>>): Promise<AnuncioData | null> {
    const rows = await this.db
      .update(anuncios)
      .set(data as any)
      .where(and(eq(anuncios.id, id), eq(anuncios.lojaId, this.tenantId)))
      .returning();
    return (rows[0] as AnuncioData) || null;
  }

  async delete(id: string): Promise<AnuncioData | null> {
    const rows = await this.db
      .delete(anuncios)
      .where(and(eq(anuncios.id, id), eq(anuncios.lojaId, this.tenantId)))
      .returning();
    return (rows[0] as AnuncioData) || null;
  }
}
