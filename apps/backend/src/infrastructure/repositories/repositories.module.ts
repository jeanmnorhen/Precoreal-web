import { Module } from '@nestjs/common';
import { TenantModule } from '../../tenant/tenant.module';
import { DrizzleAnuncioRepository } from './drizzle-anuncio-repository';
import { DrizzleLojaRepository } from './drizzle-loja-repository';
import { DrizzleUsuarioRepository } from './drizzle-usuario-repository';
import { DrizzleProdutoRepository } from './drizzle-produto-repository';
import { DrizzleFuncionarioLojaRepository } from './drizzle-funcionario-loja-repository';
import { ANUNCIO_REPOSITORY, LOJA_REPOSITORY, USUARIO_REPOSITORY, PRODUTO_REPOSITORY, FUNCIONARIO_LOJA_REPOSITORY } from '@precoreal/domain';

@Module({
  imports: [TenantModule],
  providers: [
    { provide: ANUNCIO_REPOSITORY, useClass: DrizzleAnuncioRepository },
    { provide: LOJA_REPOSITORY, useClass: DrizzleLojaRepository },
    { provide: USUARIO_REPOSITORY, useClass: DrizzleUsuarioRepository },
    { provide: PRODUTO_REPOSITORY, useClass: DrizzleProdutoRepository },
    { provide: FUNCIONARIO_LOJA_REPOSITORY, useClass: DrizzleFuncionarioLojaRepository },
  ],
  exports: [ANUNCIO_REPOSITORY, LOJA_REPOSITORY, USUARIO_REPOSITORY, PRODUTO_REPOSITORY, FUNCIONARIO_LOJA_REPOSITORY],
})
export class RepositoriesModule {}
