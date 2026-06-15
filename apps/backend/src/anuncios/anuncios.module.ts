import { Module } from '@nestjs/common';
import { AnunciosController } from './anuncios.controller';
import { AnunciosService } from './anuncios.service';
import { AuthModule } from '../auth/auth.module';
import { LojasModule } from '../lojas/lojas.module';

@Module({
  imports: [AuthModule, LojasModule],
  controllers: [AnunciosController],
  providers: [AnunciosService],
  exports: [AnunciosService],
})
export class AnunciosModule {}
