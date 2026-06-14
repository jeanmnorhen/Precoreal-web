import { Module } from '@nestjs/common';
import { AnunciosController } from './anuncios.controller';
import { AnunciosService } from './anuncios.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AnunciosController],
  providers: [AnunciosService],
  exports: [AnunciosService],
})
export class AnunciosModule {}
