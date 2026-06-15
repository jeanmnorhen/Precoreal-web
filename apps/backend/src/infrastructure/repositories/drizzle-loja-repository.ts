import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { lojas } from '@precoreal/shared';
import { eq, and } from 'drizzle-orm';
import type { ILojaRepository } from '@precoreal/domain';
import type { LojaData } from '@precoreal/domain';

@Injectable()
export class DrizzleLojaRepository implements ILojaRepository {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async findById(id: string): Promise<LojaData | null> {
    const [row] = await this.db.select().from(lojas).where(eq(lojas.id, id)).limit(1);
    return (row as LojaData) || null;
  }

  async findByProprietario(usuarioId: string): Promise<LojaData[]> {
    const rows = await this.db
      .select()
      .from(lojas)
      .where(eq(lojas.usuarioProprietarioId, usuarioId));
    return rows as LojaData[];
  }

  async findAll(): Promise<LojaData[]> {
    const rows = await this.db.select().from(lojas);
    return rows as LojaData[];
  }

  async create(data: Omit<LojaData, 'id' | 'criadoEm'>): Promise<LojaData> {
    const [row] = await this.db.insert(lojas).values(data as any).returning();
    return row as LojaData;
  }

  async update(id: string, proprietarioId: string, data: Partial<Omit<LojaData, 'id' | 'criadoEm'>>): Promise<LojaData | null> {
    const [row] = await this.db
      .update(lojas)
      .set(data as any)
      .where(and(eq(lojas.id, id), eq(lojas.usuarioProprietarioId, proprietarioId)))
      .returning();
    return (row as LojaData) || null;
  }

  async delete(id: string, proprietarioId: string): Promise<LojaData | null> {
    const [row] = await this.db
      .delete(lojas)
      .where(and(eq(lojas.id, id), eq(lojas.usuarioProprietarioId, proprietarioId)))
      .returning();
    return (row as LojaData) || null;
  }
}
