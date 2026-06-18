import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@precoreal/shared';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private _pool!: Pool;
  private _db!: ReturnType<typeof drizzle<typeof schema>>;

  async onModuleInit() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Max connections for economic VPS
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this._db = drizzle(this._pool, { schema });
  }

  async onModuleDestroy() {
    if (this._pool) {
      await this._pool.end();
    }
  }

  get database() {
    return this._db;
  }

  get pool(): Pool {
    return this._pool;
  }
}
