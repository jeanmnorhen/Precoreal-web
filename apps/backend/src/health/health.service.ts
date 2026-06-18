import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { RedisService } from '../redis/redis.service';
import { sql } from 'drizzle-orm';
import Stripe from 'stripe';

@Injectable()
export class HealthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  async observabilidade() {
    const [health, filas, erros] = await Promise.all([
      this.health(),
      this.filas(),
      this.erros(),
    ]);
    return { health, filas, erros };
  }

  private async health() {
    const servicos: any = {};

    const dbStart = Date.now();
    try {
      await this.db.execute(sql`SELECT 1`);
      servicos.bancoDeDados = { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch (err: any) {
      servicos.bancoDeDados = { status: 'erro', latencyMs: Date.now() - dbStart, error: err.message };
    }

    const redisStart = Date.now();
    try {
      await this.redisService.redis.ping();
      servicos.redis = { status: 'ok', latencyMs: Date.now() - redisStart };
    } catch (err: any) {
      servicos.redis = { status: 'erro', latencyMs: Date.now() - redisStart, error: err.message };
    }

    if (process.env.STRIPE_RESTRICTED_KEY) {
      const stripeStart = Date.now();
      try {
        const stripe = new Stripe(process.env.STRIPE_RESTRICTED_KEY, { apiVersion: '2024-04-10' as any });
        await stripe.balance.retrieve();
        servicos.stripe = { status: 'ok', latencyMs: Date.now() - stripeStart };
      } catch (err: any) {
        servicos.stripe = { status: 'erro', latencyMs: Date.now() - stripeStart, error: err.message };
      }
    } else {
      servicos.stripe = { status: 'nao_configurado' };
    }

    servicos.storage = process.env.BLOB_READ_WRITE_TOKEN
      ? { status: 'ok' }
      : { status: 'nao_configurado' };

    const values = Object.values(servicos) as { status: string }[];
    const allOk = values.every((s) => s.status === 'ok');
    const anyOk = values.some((s) => s.status === 'ok');

    return {
      status: allOk ? 'healthy' as const : anyOk ? 'degraded' as const : 'unhealthy' as const,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      servicos,
    };
  }

  private async filas() {
    const queueNames = ['notificacoes', 'impressoes'];
    const results = [];

    for (const name of queueNames) {
      const prefix = `bull:${name}`;
      const client = this.redisService.redis;

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        client.llen(`${prefix}:wait`),
        client.llen(`${prefix}:active`),
        client.llen(`${prefix}:completed`),
        client.llen(`${prefix}:failed`),
        client.zcard(`${prefix}:delayed`),
      ]);

      const metricsCompletedRaw = await client.lrange(`${prefix}:metrics:completed`, 0, -1);
      const metricsFailedRaw = await client.lrange(`${prefix}:metrics:failed`, 0, -1);

      const hoje = new Date().toISOString().slice(0, 10);
      let processadosHoje = 0;
      let falhosHoje = 0;

      for (const entry of metricsCompletedRaw) {
        const [count, ts] = entry.split(':');
        if (ts && ts.startsWith(hoje)) processadosHoje += parseInt(count, 10) || 0;
      }
      for (const entry of metricsFailedRaw) {
        const [count, ts] = entry.split(':');
        if (ts && ts.startsWith(hoje)) falhosHoje += parseInt(count, 10) || 0;
      }

      results.push({
        nome: name,
        depth: waiting + active + delayed,
        ativos: active,
        aguardando: waiting,
        processados: completed,
        falhos: failed,
        processadosHoje,
        falhosHoje,
        tempoMedioProcessamentoMs: 0,
      });
    }

    return results;
  }

  private async erros() {
    try {
      const raw = await this.redisService.redis.lrange('recent_errors', 0, 49);
      const erros = raw.map((e) => JSON.parse(e));
      return { erros, total: erros.length };
    } catch {
      return { erros: [], total: 0 };
    }
  }
}
