import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantModule } from './tenant/tenant.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { GeoModule } from './geo/geo.module';
import { StripeModule } from './stripe/stripe.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Carrega variáveis de ambiente de .env
    ConfigModule.forRoot({ isGlobal: true }),
    // Módulos de infraestrutura global
    RedisModule,
    DatabaseModule,
    TenantModule,
    IdempotencyModule,
    // Módulos de funcionalidade
    GeoModule,
    StripeModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
