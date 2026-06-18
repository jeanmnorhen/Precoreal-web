import { Module } from '@nestjs/common';
import { LojasController } from './lojas.controller';
import { AuthModule } from '../auth/auth.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [AuthModule, ApplicationModule],
  controllers: [LojasController],
})
export class LojasModule {}
