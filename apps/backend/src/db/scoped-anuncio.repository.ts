import { Injectable, Scope } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TenantContext } from '../tenant/tenant-context';
import { anuncios } from '@precoreal/shared';
import { eq, and } from 'drizzle-orm';

@Injectable({ scope: Scope.REQUEST })
export class ScopedAnuncioRepository {
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

  async findAll() {
    return this.db
      .select()
      .from(anuncios)
      .where(eq(anuncios.lojaId, this.tenantId));
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(anuncios)
      .where(and(eq(anuncios.id, id), eq(anuncios.lojaId, this.tenantId)))
      .limit(1);
    return results[0] || null;
  }

  async create(data: Omit<typeof anuncios.$inferInsert, 'lojaId'>) {
    const results = await this.db
      .insert(anuncios)
      .values({
        ...data,
        lojaId: this.tenantId, // Auto-injeta o tenant id
      })
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<Omit<typeof anuncios.$inferInsert, 'lojaId'>>,
  ) {
    const results = await this.db
      .update(anuncios)
      .set(data)
      .where(and(eq(anuncios.id, id), eq(anuncios.lojaId, this.tenantId)))
      .returning();
    return results[0] || null;
  }

  async delete(id: string) {
    const results = await this.db
      .delete(anuncios)
      .where(and(eq(anuncios.id, id), eq(anuncios.lojaId, this.tenantId)))
      .returning();
    return results[0] || null;
  }
}
