import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CriarAnuncioUseCase } from '../application/use-cases/criar-anuncio.use-case';
import { AtualizarAnuncioUseCase } from '../application/use-cases/atualizar-anuncio.use-case';
import { RenovarAnuncioUseCase } from '../application/use-cases/renovar-anuncio.use-case';
import { ListarAnunciosUseCase } from '../application/use-cases/listar-anuncios.use-case';
import { BuscarAnuncioPorIdUseCase } from '../application/use-cases/buscar-anuncio-por-id.use-case';
import { DeletarAnuncioUseCase } from '../application/use-cases/deletar-anuncio.use-case';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('anuncios')
@UseGuards(JwtAuthGuard)
export class AnunciosController {
  constructor(
    private readonly criarAnuncioUseCase: CriarAnuncioUseCase,
    private readonly atualizarAnuncioUseCase: AtualizarAnuncioUseCase,
    private readonly renovarAnuncioUseCase: RenovarAnuncioUseCase,
    private readonly listarAnunciosUseCase: ListarAnunciosUseCase,
    private readonly buscarAnuncioPorIdUseCase: BuscarAnuncioPorIdUseCase,
    private readonly deletarAnuncioUseCase: DeletarAnuncioUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateAnuncioDto, @CurrentUser() user: JwtPayload) {
    return this.criarAnuncioUseCase.execute({
      lojaId: user.lojaId || '',
      produtoId: dto.produtoId,
      titulo: dto.titulo,
      descricao: dto.descricao,
      tipo: dto.tipo,
      raioAlcanceKm: dto.raioAlcanceKm,
      custoCreditos: dto.custoCreditos,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
    });
  }

  @Get()
  findAll() {
    return this.listarAnunciosUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buscarAnuncioPorIdUseCase.execute({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnuncioDto) {
    return this.atualizarAnuncioUseCase.execute({ id, ...dto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deletarAnuncioUseCase.execute({ id });
  }

  @Post(':id/renovar')
  renovar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.renovarAnuncioUseCase.execute({ anuncioId: id, usuarioId: user.userId });
  }
}
