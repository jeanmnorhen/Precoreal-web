import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ComprarCreditosUseCase } from '../application/use-cases/comprar-creditos.use-case';
import { ObterDashboardLojistaUseCase } from '../application/use-cases/obter-dashboard-lojista.use-case';
import { AdicionarFuncionarioUseCase } from '../application/use-cases/adicionar-funcionario.use-case';
import { RemoverFuncionarioUseCase } from '../application/use-cases/remover-funcionario.use-case';
import { ListarFuncionariosLojaUseCase } from '../application/use-cases/listar-funcionarios-loja.use-case';
import { AtualizarTurnosFuncionarioUseCase } from '../application/use-cases/atualizar-turnos-funcionario.use-case';
import { LojistaGuard } from './lojista.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { ComprarCreditosDto } from './dto/comprar-creditos.dto';
import { AddFuncionarioDto } from './dto/add-funcionario.dto';
import { UpdateTurnosDto } from './dto/update-turnos.dto';

@Controller('lojista')
@UseGuards(JwtAuthGuard, LojistaGuard)
export class LojistaController {
  constructor(
    private readonly obterDashboardLojistaUseCase: ObterDashboardLojistaUseCase,
    private readonly comprarCreditosUseCase: ComprarCreditosUseCase,
    private readonly adicionarFuncionarioUseCase: AdicionarFuncionarioUseCase,
    private readonly removerFuncionarioUseCase: RemoverFuncionarioUseCase,
    private readonly listarFuncionariosLojaUseCase: ListarFuncionariosLojaUseCase,
    private readonly atualizarTurnosFuncionarioUseCase: AtualizarTurnosFuncionarioUseCase,
  ) {}

  @Get('dashboard')
  async dashboard(@CurrentUser() user: JwtPayload) {
    return this.obterDashboardLojistaUseCase.execute({ usuarioId: user.userId });
  }

  @Post('creditos/comprar')
  async comprarCreditos(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ComprarCreditosDto,
  ) {
    return this.comprarCreditosUseCase.execute({
      usuarioId: user.userId,
      email: user.email,
      valorCentavos: dto.valorCentavos,
    });
  }

  @Get('funcionarios')
  async listarFuncionarios(@Query('lojaId') lojaId: string) {
    return this.listarFuncionariosLojaUseCase.execute({ lojaId });
  }

  @Post('funcionarios')
  async adicionarFuncionario(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddFuncionarioDto,
  ) {
    return this.adicionarFuncionarioUseCase.execute({
      proprietarioId: user.userId,
      email: dto.email,
      lojaId: dto.lojaId,
      turnos: dto.turnos,
    });
  }

  @Patch('funcionarios/:id/turnos')
  async atualizarTurnos(
    @Param('id') id: string,
    @Body() dto: UpdateTurnosDto,
  ) {
    return this.atualizarTurnosFuncionarioUseCase.execute({ id, turnos: dto.turnos });
  }

  @Delete('funcionarios/:id')
  async removerFuncionario(@Param('id') id: string) {
    return this.removerFuncionarioUseCase.execute({ id });
  }
}
