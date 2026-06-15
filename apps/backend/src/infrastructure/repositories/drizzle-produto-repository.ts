import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { produtos } from '@precoreal/shared';
import { eq, or, ilike } from 'drizzle-orm';
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

  async search(query: string): Promise<ProdutoData[]> {
    const pattern = `%${query}%`;
    const rows = await this.db
      .select()
      .from(produtos)
      .where(or(ilike(produtos.nome, pattern), ilike(produtos.marca, pattern)))
      .limit(20);
    return rows as ProdutoData[];
  }

  async create(data: Omit<ProdutoData, 'id' | 'criadoEm'>): Promise<ProdutoData> {
    const [row] = await this.db.insert(produtos).values(data as any).returning();
    return row as ProdutoData;
  }
}
