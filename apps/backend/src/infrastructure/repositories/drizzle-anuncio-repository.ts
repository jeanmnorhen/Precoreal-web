import { Injectable, Scope } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { TenantContext } from '../../tenant/tenant-context';
import { anuncios } from '@precoreal/shared';
import { eq, and } from 'drizzle-orm';
import type { IAnuncioRepository } from '@precoreal/domain';
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
