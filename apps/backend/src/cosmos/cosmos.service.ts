import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { cosmosQuotas } from '@precoreal/shared';
import { eq, sql } from 'drizzle-orm';

export interface CosmosProdutoRaw {
  gtin: string;
  description: string;
  brand: { name: string };
  ncm: { code: string };
  gpc: { description: string };
  thumbnail: string | null;
  price_min: number | null;
  price_max: number | null;
}

export interface CosmosSearchResult {
  products: CosmosProdutoRaw[];
}

@Injectable()
export class CosmosService {
  private static readonly API_BASE = 'https://api.cosmos.bluesoft.com.br';
  private static readonly TIMEOUT = 10_000;
  private static readonly QUOTA_LIMIT = 25;

  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  private get token(): string {
    return process.env.COSMOS_TOKEN || '';
  }

  private get userAgent(): string {
    return process.env.COSMOS_USER_AGENT || 'PrecoReal/1.0';
  }

  private async request<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CosmosService.TIMEOUT);

    const res = await fetch(`${CosmosService.API_BASE}${path}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Cosmos-Token': this.token,
        'User-Agent': this.userAgent,
      },
    });
    clearTimeout(timeout);

    if (res.status === 429) {
      throw new CosmosQuotaExcedidaError();
    }
    if (!res.ok) {
      throw new Error(`Cosmos API retornou ${res.status}`);
    }

    return res.json();
  }

  async verificarQuota(): Promise<{ disponivel: boolean; usadas: number; limite: number }> {
    const hoje = new Date().toISOString().split('T')[0];

    const [row] = await this.db
      .select()
      .from(cosmosQuotas)
      .where(eq(cosmosQuotas.data, hoje))
      .limit(1);

    const usadas = row?.consultasUtilizadas ?? 0;
    const limite = row?.limiteDiario ?? CosmosService.QUOTA_LIMIT;

    return { disponivel: usadas < limite, usadas, limite };
  }

  async incrementarQuota(): Promise<void> {
    const hoje = new Date().toISOString().split('T')[0];

    await this.db
      .insert(cosmosQuotas)
      .values({ data: hoje, consultasUtilizadas: 1, limiteDiario: CosmosService.QUOTA_LIMIT })
      .onConflictDoUpdate({
        target: cosmosQuotas.data,
        set: { consultasUtilizadas: sql`${cosmosQuotas.consultasUtilizadas} + 1` },
      });
  }

  async buscarPorGtin(gtin: string): Promise<CosmosProdutoRaw | null> {
    const quota = await this.verificarQuota();
    if (!quota.disponivel) throw new CosmosQuotaExcedidaError();

    try {
      const data = await this.request<CosmosProdutoRaw>(`/gtins/${gtin}.json`);
      await this.incrementarQuota();
      return data;
    } catch (err) {
      if (err instanceof CosmosQuotaExcedidaError) throw err;
      return null;
    }
  }

  async pesquisarPorNome(termo: string): Promise<CosmosProdutoRaw[]> {
    const quota = await this.verificarQuota();
    if (!quota.disponivel) throw new CosmosQuotaExcedidaError();

    try {
      const data = await this.request<CosmosSearchResult>(`/gtins.json?query=${encodeURIComponent(termo)}`);
      await this.incrementarQuota();
      return data.products || [];
    } catch (err) {
      if (err instanceof CosmosQuotaExcedidaError) throw err;
      return [];
    }
  }

  async obterQuota(): Promise<{ data: string; consultasUtilizadas: number; limiteDiario: number; disponiveis: number }> {
    const hoje = new Date().toISOString().split('T')[0];
    const [row] = await this.db
      .select()
      .from(cosmosQuotas)
      .where(eq(cosmosQuotas.data, hoje))
      .limit(1);

    const consultasUtilizadas = row?.consultasUtilizadas ?? 0;
    const limiteDiario = row?.limiteDiario ?? CosmosService.QUOTA_LIMIT;

    return {
      data: hoje,
      consultasUtilizadas,
      limiteDiario,
      disponiveis: Math.max(0, limiteDiario - consultasUtilizadas),
    };
  }

  async ajustarLimite(novoLimite: number): Promise<void> {
    const hoje = new Date().toISOString().split('T')[0];

    await this.db
      .insert(cosmosQuotas)
      .values({ data: hoje, consultasUtilizadas: 0, limiteDiario: novoLimite })
      .onConflictDoUpdate({
        target: cosmosQuotas.data,
        set: { limiteDiario: novoLimite },
      });
  }
}

export class CosmosQuotaExcedidaError extends Error {
  constructor() {
    super('Limite diário de consultas à Cosmos atingido (25/dia).');
    this.name = 'CosmosQuotaExcedidaError';
  }
}
