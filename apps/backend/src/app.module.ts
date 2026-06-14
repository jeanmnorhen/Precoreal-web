import { Module } from '@nestjs/common';
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
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
