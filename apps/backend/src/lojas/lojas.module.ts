import { Module } from '@nestjs/common';
import { LojasController } from './lojas.controller';
import { LojasService } from './lojas.service';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [LojasController],
  providers: [LojasService],
  exports: [LojasService],
})
export class LojasModule {}
