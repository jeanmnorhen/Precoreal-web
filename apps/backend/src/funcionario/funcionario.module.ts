import { Module } from '@nestjs/common';
import { FuncionarioController } from './funcionario.controller';
import { FuncionarioGuard } from './funcionario.guard';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [RepositoriesModule, ApplicationModule],
  controllers: [FuncionarioController],
  providers: [FuncionarioGuard],
})
export class FuncionarioModule {}
