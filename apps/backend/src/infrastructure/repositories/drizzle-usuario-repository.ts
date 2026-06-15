import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { usuarios } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';
import type { IUsuarioRepository } from '@precoreal/domain';
import type { UsuarioData } from '@precoreal/domain';

@Injectable()
export class DrizzleUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async findById(id: string): Promise<UsuarioData | null> {
    const [row] = await this.db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
    return (row as UsuarioData) || null;
  }

  async findByEmail(email: string): Promise<UsuarioData | null> {
    const [row] = await this.db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
    return (row as UsuarioData) || null;
  }

  async create(data: Omit<UsuarioData, 'id' | 'criadoEm'>): Promise<UsuarioData> {
    const [row] = await this.db.insert(usuarios).values(data as any).returning();
    return row as UsuarioData;
  }

  async update(id: string, data: Partial<Omit<UsuarioData, 'id' | 'criadoEm'>>): Promise<UsuarioData | null> {
    const [row] = await this.db.update(usuarios).set(data as any).where(eq(usuarios.id, id)).returning();
    return (row as UsuarioData) || null;
  }

  async debitarCreditos(id: string, valor: number): Promise<number> {
    const [row] = await this.db
      .update(usuarios)
      .set({ saldoCreditos: sql`${usuarios.saldoCreditos} - ${valor}` })
      .where(eq(usuarios.id, id))
      .returning({ saldoCreditos: usuarios.saldoCreditos });
    return row?.saldoCreditos || 0;
  }
}
