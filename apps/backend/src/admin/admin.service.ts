import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { RedisService } from '../redis/redis.service';
import { usuarios, anuncios, lojas, produtos } from '@precoreal/shared';
import { sql, eq, and, gte, desc } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import Stripe from 'stripe';

const execAsync = promisify(exec);

@Injectable()
export class AdminService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  async dashboard() {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [userCount] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(usuarios)
      .where(gte(usuarios.criadoEm, trintaDiasAtras));

    const [ofertaCount] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(anuncios);

    const [lojaCount] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(lojas)
      .where(gte(lojas.criadoEm, trintaDiasAtras));

    return {
      usuariosAtivos: Number(userCount?.total || 0),
      totalOfertas: Number(ofertaCount?.total || 0),
      novasLojas: Number(lojaCount?.total || 0),
    };
  }

  async monitoramentoPrecos(
    produtoId?: string,
    regiao?: string,
    _periodo?: string,
  ) {
    const query = this.db
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

    const pontos = (await query).map((p) => ({
      data: p.data?.toISOString() || new Date().toISOString(),
      precoMedio: p.precoMedio,
      regiao: p.regiao,
    }));

    return { pontos };
  }

  async monitoramentoUso(_periodo?: string) {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usuariosPorDia = await this.db
      .select({
        data: sql<string>`DATE(${usuarios.criadoEm})`,
        total: sql<number>`count(*)`,
      })
      .from(usuarios)
      .where(gte(usuarios.criadoEm, trintaDiasAtras))
      .groupBy(sql`DATE(${usuarios.criadoEm})`)
      .orderBy(sql`DATE(${usuarios.criadoEm})`);

    const topProdutos = await this.db
      .select({
        produtoId: produtos.id,
        nome: produtos.nome,
        totalBuscas: sql<number>`count(*)`,
      })
      .from(anuncios)
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(gte(anuncios.criadoEm, trintaDiasAtras))
      .groupBy(produtos.id, produtos.nome)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return {
      volumeBuscas: usuariosPorDia.map((d) => ({
        data: d.data,
        total: Number(d.total),
      })),
      produtosMaisBuscados: topProdutos.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        totalBuscas: Number(p.totalBuscas),
      })),
      engajamento: usuariosPorDia.map((d) => ({
        data: d.data,
        usuariosAtivos: Number(d.total),
      })),
    };
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

  async executarTestes() {
    const backendDir = join(__dirname, '..', '..');

    const parseJestOutput = (stdout: string) => {
      try {
        return JSON.parse(stdout);
      } catch {
        return null;
      }
    };

    const extrairSuites = (data: any): { name: string; status: 'passed' | 'failed'; duration: number; numPassingTests: number; numFailingTests: number; failureMessage?: string }[] => {
      if (!data?.testResults) return [];
      return data.testResults.map((r: any) => ({
        name: r.name.replace(/\\/g, '/').split('/').slice(-3).join('/'),
        status: r.status === 'passed' ? 'passed' as const : 'failed' as const,
        duration: r.endTime - r.startTime,
        numPassingTests: r.assertionResults.filter((a: any) => a.status === 'passed').length,
        numFailingTests: r.assertionResults.filter((a: any) => a.status === 'failed').length,
        failureMessage: r.message || undefined,
      }));
    };

    let unitResult = { numPassedSuites: 0, numFailedSuites: 0, numPassedTests: 0, numFailedTests: 0, suites: [] as any[], duration: 0 };
    let e2eResult = { numPassedSuites: 0, numFailedSuites: 0, numPassedTests: 0, numFailedTests: 0, suites: [] as any[], duration: 0 };
    let coverageData = null as any;

    try {
      const unitOut = await execAsync('npx jest --json --coverage 2>/dev/null', { cwd: backendDir, maxBuffer: 10 * 1024 * 1024, timeout: 120000 });
      const parsed = parseJestOutput(unitOut.stdout);
      if (parsed) {
        unitResult = {
          numPassedSuites: parsed.numPassedTestSuites || 0,
          numFailedSuites: parsed.numFailedTestSuites || 0,
          numPassedTests: parsed.numPassedTests || 0,
          numFailedTests: parsed.numFailedTests || 0,
          suites: extrairSuites(parsed),
          duration: (parsed.startTime && parsed.testResults?.length ? (parsed.testResults[parsed.testResults.length - 1].endTime - parsed.startTime) : 0),
        };
        coverageData = parsed.coverageMap ? {
          lines: Math.round(parsed.coverageMap.data?.lines?.pct || 0),
          statements: Math.round(parsed.coverageMap.data?.statements?.pct || 0),
          functions: Math.round(parsed.coverageMap.data?.functions?.pct || 0),
          branches: Math.round(parsed.coverageMap.data?.branches?.pct || 0),
        } : null;
      }
    } catch (err: any) {
      if (err.stdout) {
        const parsed = parseJestOutput(err.stdout);
        if (parsed) {
          unitResult = {
            numPassedSuites: parsed.numPassedTestSuites || 0,
            numFailedSuites: parsed.numFailedTestSuites || 0,
            numPassedTests: parsed.numPassedTests || 0,
            numFailedTests: parsed.numFailedTests || 0,
            suites: extrairSuites(parsed),
            duration: (parsed.startTime && parsed.testResults?.length ? (parsed.testResults[parsed.testResults.length - 1].endTime - parsed.startTime) : 0),
          };
        }
      }
    }

    try {
      const e2eOut = await execAsync('npx jest --config ./test/jest-e2e.json --json 2>/dev/null', { cwd: backendDir, maxBuffer: 10 * 1024 * 1024, timeout: 120000 });
      const parsed = parseJestOutput(e2eOut.stdout);
      if (parsed) {
        e2eResult = {
          numPassedSuites: parsed.numPassedTestSuites || 0,
          numFailedSuites: parsed.numFailedTestSuites || 0,
          numPassedTests: parsed.numPassedTests || 0,
          numFailedTests: parsed.numFailedTests || 0,
          suites: extrairSuites(parsed),
          duration: (parsed.startTime && parsed.testResults?.length ? (parsed.testResults[parsed.testResults.length - 1].endTime - parsed.startTime) : 0),
        };
      }
    } catch (err: any) {
      if (err.stdout) {
        const parsed = parseJestOutput(err.stdout);
        if (parsed) {
          e2eResult = {
            numPassedSuites: parsed.numPassedTestSuites || 0,
            numFailedSuites: parsed.numFailedTestSuites || 0,
            numPassedTests: parsed.numPassedTests || 0,
            numFailedTests: parsed.numFailedTests || 0,
            suites: extrairSuites(parsed),
            duration: (parsed.startTime && parsed.testResults?.length ? (parsed.testResults[parsed.testResults.length - 1].endTime - parsed.startTime) : 0),
          };
        }
      }
    }

    return {
      unit: unitResult,
      e2e: e2eResult,
      coverage: coverageData,
    };
  }
}
