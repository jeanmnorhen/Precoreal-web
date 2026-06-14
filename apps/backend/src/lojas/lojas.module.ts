import { Module } from '@nestjs/common';
import { LojasController } from './lojas.controller';
import { LojasService } from './lojas.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LojasController],
  providers: [LojasService],
  exports: [LojasService],
})
export class LojasModule {}
