import { Module } from '@nestjs/common';
import { AnunciosController } from './anuncios.controller';
import { AuthModule } from '../auth/auth.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [AuthModule, ApplicationModule],
  controllers: [AnunciosController],
})
export class AnunciosModule {}
