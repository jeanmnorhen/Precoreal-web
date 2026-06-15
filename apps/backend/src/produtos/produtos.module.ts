import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [ProdutosController],
  providers: [ProdutosService],
  exports: [ProdutosService],
})
export class ProdutosModule {}
