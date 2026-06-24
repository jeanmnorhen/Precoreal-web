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
import { CriarLojaUseCase } from '../application/use-cases/criar-loja.use-case';
import { ObterPerfilPublicoLojaUseCase } from '../application/use-cases/obter-perfil-publico-loja.use-case';
import { ListarLojasProprietarioUseCase } from '../application/use-cases/listar-lojas-proprietario.use-case';
import { BuscarLojaPorIdUseCase } from '../application/use-cases/buscar-loja-por-id.use-case';
import { AtualizarLojaUseCase } from '../application/use-cases/atualizar-loja.use-case';
import { DeletarLojaUseCase } from '../application/use-cases/deletar-loja.use-case';
import { CreateLojaDto } from './dto/create-loja.dto';
import { UpdateLojaDto } from './dto/update-loja.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('lojas')
export class LojasController {
  constructor(
    private readonly criarLojaUseCase: CriarLojaUseCase,
    private readonly obterPerfilPublicoLojaUseCase: ObterPerfilPublicoLojaUseCase,
    private readonly listarLojasProprietarioUseCase: ListarLojasProprietarioUseCase,
    private readonly buscarLojaPorIdUseCase: BuscarLojaPorIdUseCase,
    private readonly atualizarLojaUseCase: AtualizarLojaUseCase,
    private readonly deletarLojaUseCase: DeletarLojaUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLojaDto) {
    return this.criarLojaUseCase.execute({
      usuarioId: user.userId,
      nome: dto.nome,
      descricao: dto.descricao,
      enderecoRua: dto.enderecoRua,
      enderecoNumero: dto.enderecoNumero,
      enderecoBairro: dto.enderecoBairro,
      enderecoCidade: dto.enderecoCidade,
      enderecoEstado: dto.enderecoEstado,
      enderecoCep: dto.enderecoCep,
      latitude: dto.latitude,
      longitude: dto.longitude,
      logoUrl: dto.logoUrl,
      cnpj: dto.cnpj,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listarMinhas(@CurrentUser() user: JwtPayload) {
    return this.listarLojasProprietarioUseCase.execute({ usuarioId: user.userId });
  }

  @Get('public/:id')
  findPublic(@Param('id') id: string) {
    return this.obterPerfilPublicoLojaUseCase.execute({ lojaId: id });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.buscarLojaPorIdUseCase.execute({ id });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLojaDto,
  ) {
    return this.atualizarLojaUseCase.execute({ id, usuarioId: user.userId, ...dto });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deletarLojaUseCase.execute({ id, usuarioId: user.userId });
  }
}
