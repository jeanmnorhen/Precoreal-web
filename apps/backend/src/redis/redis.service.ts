import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private _client!: Redis;

  onModuleInit() {
    this._client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : 6379,
      maxRetriesPerRequest: null, // Necessário para compatibilidade com BullMQ
    });
  }

  onModuleDestroy() {
    if (this._client) {
      this._client.disconnect();
    }
  }

  get redis() {
    return this._client;
  }

  get client(): Redis {
    return this._client;
  }
}
