import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { VerificarAcessoFuncionarioUseCase } from '../application/use-cases/verificar-acesso-funcionario.use-case';
import { ListarLojasFuncionarioUseCase } from '../application/use-cases/listar-lojas-funcionario.use-case';
import { ListarProdutosLojaUseCase } from '../application/use-cases/listar-produtos-loja.use-case';
import { ListarAnunciosLojaUseCase } from '../application/use-cases/listar-anuncios-loja.use-case';
import { FuncionarioGuard } from './funcionario.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { VerificarAcessoDto } from './dto/verificar-acesso.dto';

@Controller('funcionario')
export class FuncionarioController {
  constructor(
    private readonly verificarAcessoFuncionarioUseCase: VerificarAcessoFuncionarioUseCase,
    private readonly listarLojasFuncionarioUseCase: ListarLojasFuncionarioUseCase,
    private readonly listarProdutosLojaUseCase: ListarProdutosLojaUseCase,
    private readonly listarAnunciosLojaUseCase: ListarAnunciosLojaUseCase,
  ) {}

  @Get('lojas')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarLojas(@CurrentUser() user: JwtPayload) {
    return this.listarLojasFuncionarioUseCase.execute({ usuarioId: user.userId });
  }

  @Post('verificar-acesso/:lojaId')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async verificarAcesso(
    @CurrentUser() user: JwtPayload,
    @Param('lojaId') lojaId: string,
    @Body() dto: VerificarAcessoDto,
  ) {
    return this.verificarAcessoFuncionarioUseCase.execute({
      usuarioId: user.userId,
      lojaId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  @Get(':lojaId/produtos')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarProdutos(@Param('lojaId') lojaId: string) {
    return this.listarProdutosLojaUseCase.execute({ lojaId });
  }

  @Get(':lojaId/anuncios')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarAnuncios(@Param('lojaId') lojaId: string) {
    return this.listarAnunciosLojaUseCase.execute({ lojaId });
  }
}
