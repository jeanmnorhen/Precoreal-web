import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { AuthModule } from '../auth/auth.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [AuthModule, ApplicationModule],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
