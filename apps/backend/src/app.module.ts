import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantModule } from './tenant/tenant.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { GeoModule } from './geo/geo.module';
import { StripeModule } from './stripe/stripe.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { LojasModule } from './lojas/lojas.module';
import { ProdutosModule } from './produtos/produtos.module';
import { AnunciosModule } from './anuncios/anuncios.module';
import { QueuesModule } from './queues/queues.module';
import { ScannerModule } from './scanner/scanner.module';
import { LojistaModule } from './lojista/lojista.module';
import { AdminModule } from './admin/admin.module';
import { FuncionarioModule } from './funcionario/funcionario.module';
import { MetricsModule } from './metrics/metrics.module';
import { ApplicationModule } from './application/application.module';
import { CnpjModule } from './cnpj/cnpj.module';
import { CosmosModule } from './cosmos/cosmos.module';
import { CreditosGratisModule } from './creditos/creditos-gratis.module';
import { ApplicationExceptionFilter } from './application/filters/application-exception.filter';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    DatabaseModule,
    TenantModule,
    IdempotencyModule,
    GeoModule,
    StripeModule,
    StorageModule,
    AuthModule,
    UsuariosModule,
    LojasModule,
    ProdutosModule,
    AnunciosModule,
    QueuesModule,
    ScannerModule,
    LojistaModule,
    AdminModule,
    FuncionarioModule,
    MetricsModule,
    ApplicationModule,
    CnpjModule,
    CosmosModule,
    CreditosGratisModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: ApplicationExceptionFilter },
  ],
})
export class AppModule {}
