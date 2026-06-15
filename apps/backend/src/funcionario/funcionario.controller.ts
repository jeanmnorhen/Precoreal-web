import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service';
import { FuncionarioGuard } from './funcionario.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { VerificarAcessoDto } from './dto/verificar-acesso.dto';
import { DatabaseService } from '../db/database.service';
import { anuncios, produtos, lojas } from '@precoreal/shared';
import { eq, and } from 'drizzle-orm';

@Controller('funcionario')
export class FuncionarioController {
  constructor(
    private readonly funcionarioService: FuncionarioService,
    private readonly dbService: DatabaseService,
  ) {}

  private get db() {
    return this.dbService.database;
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
    return this.db
      .select()
      .from(produtos)
      .innerJoin(anuncios, eq(anuncios.produtoId, produtos.id))
      .where(eq(anuncios.lojaId, lojaId))
      .limit(100);
  }

  @Get(':lojaId/anuncios')
  @UseGuards(JwtAuthGuard, FuncionarioGuard)
  async listarAnuncios(@Param('lojaId') lojaId: string) {
    return this.db
      .select()
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .where(
        and(
          eq(anuncios.lojaId, lojaId),
          eq(anuncios.status, 'ativo'),
        ),
      )
      .limit(100);
  }
}
