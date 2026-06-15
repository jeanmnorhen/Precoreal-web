import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service';
import { FuncionarioGuard } from './funcionario.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { VerificarAcessoDto } from './dto/verificar-acesso.dto';

@Controller('funcionario')
export class FuncionarioController {
  constructor(
    private readonly funcionarioService: FuncionarioService,
  ) {}

  @Get('lojas')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarLojas(@CurrentUser() user: JwtPayload) {
    return this.funcionarioService.listarLojas(user.userId);
  }

  @Post('verificar-acesso/:lojaId')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async verificarAcesso(
    @CurrentUser() user: JwtPayload,
    @Param('lojaId') lojaId: string,
    @Body() dto: VerificarAcessoDto,
  ) {
    return this.funcionarioService.verificarAcesso(
      user.userId,
      lojaId,
      dto.latitude,
      dto.longitude,
    );
  }

  @Get(':lojaId/produtos')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarProdutos(@Param('lojaId') lojaId: string) {
    return this.funcionarioService.listarProdutos(lojaId);
  }

  @Get(':lojaId/anuncios')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarAnuncios(@Param('lojaId') lojaId: string) {
    return this.funcionarioService.listarAnuncios(lojaId);
  }
}
