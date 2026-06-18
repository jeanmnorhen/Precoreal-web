import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { AuthModule } from '../auth/auth.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [AuthModule, ApplicationModule],
  controllers: [ProdutosController],
})
export class ProdutosModule {}
