import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { LojistaService } from './lojista.service';
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
  constructor(private readonly lojistaService: LojistaService) {}

  @Get('dashboard')
  async dashboard(@CurrentUser() user: JwtPayload) {
    return this.lojistaService.dashboard(user.userId);
  }

  @Post('creditos/comprar')
  async comprarCreditos(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ComprarCreditosDto,
  ) {
    return this.lojistaService.comprarCreditos(
      user.userId,
      user.email,
      dto.valorCentavos,
    );
  }

  @Get('funcionarios')
  async listarFuncionarios(@Query('lojaId') lojaId: string) {
    return this.lojistaService.listarFuncionarios(lojaId);
  }

  @Post('funcionarios')
  async adicionarFuncionario(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddFuncionarioDto,
  ) {
    return this.lojistaService.adicionarFuncionario(
      user.userId,
      dto.email,
      dto.lojaId,
      dto.turnos,
    );
  }

  @Patch('funcionarios/:id/turnos')
  async atualizarTurnos(
    @Param('id') id: string,
    @Body() dto: UpdateTurnosDto,
  ) {
    return this.lojistaService.atualizarTurnos(id, dto.turnos);
  }

  @Delete('funcionarios/:id')
  async removerFuncionario(@Param('id') id: string) {
    return this.lojistaService.removerFuncionario(id);
  }
}
