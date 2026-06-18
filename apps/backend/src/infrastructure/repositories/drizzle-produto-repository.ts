import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { produtos, anuncios, lojas } from '@precoreal/shared';
import { eq, or, ilike, and, sql, desc } from 'drizzle-orm';
import type { IProdutoRepository } from '@precoreal/domain';
import type { ProdutoData } from '@precoreal/domain';

@Injectable()
export class DrizzleProdutoRepository implements IProdutoRepository {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async findById(id: string): Promise<ProdutoData | null> {
    const [row] = await this.db.select().from(produtos).where(eq(produtos.id, id)).limit(1);
    return (row as ProdutoData) || null;
  }

  async findByCodigoBarras(codigo: string): Promise<ProdutoData | null> {
    const [row] = await this.db.select().from(produtos).where(eq(produtos.codigoBarras, codigo)).limit(1);
    return (row as ProdutoData) || null;
  }

  async findAll(): Promise<ProdutoData[]> {
    const rows = await this.db.select().from(produtos).limit(50);
    return rows as ProdutoData[];
  }

  async search(query: string): Promise<ProdutoData[]> {
    const pattern = `%${query}%`;
    const rows = await this.db
      .select()
      .from(produtos)
      .where(or(
        ilike(produtos.nome, pattern),
        ilike(produtos.codigoBarras, pattern),
        ilike(produtos.marca, pattern),
        ilike(produtos.categoria, pattern),
      ))
      .limit(50);
    return rows as ProdutoData[];
  }

  async getPrecoHistory(produtoId?: string, regiao?: string): Promise<{ data: string; precoMedio: number; regiao: string | null }[]> {
    const rows = await this.db
      .select({
        data: produtos.criadoEm,
        precoMedio: produtos.precoMedio,
        regiao: lojas.enderecoEstado,
      })
      .from(produtos)
      .innerJoin(anuncios, eq(anuncios.produtoId, produtos.id))
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .where(
        and(
          produtoId ? eq(produtos.id, produtoId) : sql`1=1`,
          regiao ? eq(lojas.enderecoEstado, regiao) : sql`1=1`,
        ),
      )
      .orderBy(desc(produtos.criadoEm))
      .limit(100);
    return rows.map((r) => ({
      data: r.data?.toISOString() || new Date().toISOString(),
      precoMedio: r.precoMedio,
      regiao: r.regiao,
    }));
  }

  async create(data: Omit<ProdutoData, 'id' | 'criadoEm'>): Promise<ProdutoData> {
    const [row] = await this.db.insert(produtos).values(data as any).returning();
    return row as ProdutoData;
  }

  async update(id: string, data: Partial<Omit<ProdutoData, 'id' | 'criadoEm'>>): Promise<ProdutoData | null> {
    const [row] = await this.db.update(produtos).set(data as any).where(eq(produtos.id, id)).returning();
    return (row as ProdutoData) || null;
  }

  async delete(id: string): Promise<ProdutoData | null> {
    const [row] = await this.db.delete(produtos).where(eq(produtos.id, id)).returning();
    return (row as ProdutoData) || null;
  }
}
