import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { RedisService } from '../redis/redis.service';
import { Registry, Gauge, collectDefaultMetrics } from 'prom-client';
import { Pool } from 'pg';
import Redis from 'ioredis';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
  ) {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });
  }

  onModuleInit() {
    const db = this.dbService as unknown as { pool: Pool };
    const redis = this.redisService as unknown as { client: Redis };

    new Gauge({
      name: 'db_pool_total_connections',
      help: 'Total connections in the PostgreSQL pool',
      registers: [this.registry],
      collect() {
        this.set(db.pool.totalCount || 0);
      },
    });

    new Gauge({
      name: 'db_pool_idle_connections',
      help: 'Idle connections in the PostgreSQL pool',
      registers: [this.registry],
      collect() {
        this.set(db.pool.idleCount || 0);
      },
    });

    new Gauge({
      name: 'redis_connected',
      help: 'Whether Redis is connected (1 = connected, 0 = disconnected)',
      registers: [this.registry],
      collect() {
        this.set(redis.client.status === 'ready' ? 1 : 0);
      },
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
