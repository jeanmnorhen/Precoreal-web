import { Module } from '@nestjs/common';
import { FuncionarioController } from './funcionario.controller';
import { FuncionarioService } from './funcionario.service';
import { FuncionarioGuard } from './funcionario.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FuncionarioController],
  providers: [FuncionarioService, FuncionarioGuard],
})
export class FuncionarioModule {}
