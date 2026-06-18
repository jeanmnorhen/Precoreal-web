import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { RedisService } from '../redis/redis.service';
import { Registry, Gauge, collectDefaultMetrics } from 'prom-client';

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
    const { dbService, redisService } = this;

    new Gauge({
      name: 'db_pool_total_connections',
      help: 'Total connections in the PostgreSQL pool',
      registers: [this.registry],
      collect(this: Gauge<string>) {
        this.set(dbService.pool.totalCount || 0);
      },
    });

    new Gauge({
      name: 'db_pool_idle_connections',
      help: 'Idle connections in the PostgreSQL pool',
      registers: [this.registry],
      collect(this: Gauge<string>) {
        this.set(dbService.pool.idleCount || 0);
      },
    });

    new Gauge({
      name: 'redis_connected',
      help: 'Whether Redis is connected (1 = connected, 0 = disconnected)',
      registers: [this.registry],
      collect(this: Gauge<string>) {
        this.set(redisService.client.status === 'ready' ? 1 : 0);
      },
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
