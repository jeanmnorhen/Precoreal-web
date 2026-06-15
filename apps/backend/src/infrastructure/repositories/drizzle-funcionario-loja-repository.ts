import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { funcionariosLojas } from '@precoreal/shared';
import { eq, and } from 'drizzle-orm';
import type { IFuncionarioLojaRepository } from '@precoreal/domain';
import type { FuncionarioLojaData } from '@precoreal/domain';

@Injectable()
export class DrizzleFuncionarioLojaRepository implements IFuncionarioLojaRepository {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async findById(id: string): Promise<FuncionarioLojaData | null> {
    const [row] = await this.db.select().from(funcionariosLojas).where(eq(funcionariosLojas.id, id)).limit(1);
    return (row as FuncionarioLojaData) || null;
  }

  async findByLojaId(lojaId: string): Promise<FuncionarioLojaData[]> {
    const rows = await this.db.select().from(funcionariosLojas).where(eq(funcionariosLojas.lojaId, lojaId));
    return rows as FuncionarioLojaData[];
  }

  async findVinculo(usuarioId: string, lojaId: string): Promise<FuncionarioLojaData | null> {
    const [row] = await this.db
      .select()
      .from(funcionariosLojas)
      .where(and(eq(funcionariosLojas.usuarioId, usuarioId), eq(funcionariosLojas.lojaId, lojaId)))
      .limit(1);
    return (row as FuncionarioLojaData) || null;
  }

  async create(data: Omit<FuncionarioLojaData, 'id' | 'criadoEm'>): Promise<FuncionarioLojaData> {
    const [row] = await this.db.insert(funcionariosLojas).values(data as any).returning();
    return row as FuncionarioLojaData;
  }

  async update(id: string, data: Partial<Omit<FuncionarioLojaData, 'id'>>): Promise<FuncionarioLojaData | null> {
    const [row] = await this.db.update(funcionariosLojas).set(data as any).where(eq(funcionariosLojas.id, id)).returning();
    return (row as FuncionarioLojaData) || null;
  }

  async delete(id: string): Promise<FuncionarioLojaData | null> {
    const [row] = await this.db.delete(funcionariosLojas).where(eq(funcionariosLojas.id, id)).returning();
    return (row as FuncionarioLojaData) || null;
  }
}
