import { Module } from '@nestjs/common';
import { AnunciosController } from './anuncios.controller';
import { AnunciosService } from './anuncios.service';
import { AuthModule } from '../auth/auth.module';
import { LojasModule } from '../lojas/lojas.module';
import { TenantModule } from '../tenant/tenant.module';
import { ANUNCIO_REPOSITORY, USUARIO_REPOSITORY } from '@precoreal/domain';
import { DrizzleAnuncioRepository } from '../infrastructure/repositories/drizzle-anuncio-repository';
import { DrizzleUsuarioRepository } from '../infrastructure/repositories/drizzle-usuario-repository';

@Module({
  imports: [AuthModule, LojasModule, TenantModule],
  controllers: [AnunciosController],
  providers: [
    AnunciosService,
    { provide: ANUNCIO_REPOSITORY, useClass: DrizzleAnuncioRepository },
    { provide: USUARIO_REPOSITORY, useClass: DrizzleUsuarioRepository },
  ],
  exports: [AnunciosService],
})
export class AnunciosModule {}
