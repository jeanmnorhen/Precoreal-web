import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CriarProdutoUseCase } from '../application/use-cases/criar-produto.use-case';
import { ListarProdutosUseCase } from '../application/use-cases/listar-produtos.use-case';
import { BuscarProdutoCodigoBarrasUseCase } from '../application/use-cases/buscar-produto-codigo-barras.use-case';
import { BuscarProdutoPorIdUseCase } from '../application/use-cases/buscar-produto-por-id.use-case';
import { AtualizarProdutoUseCase } from '../application/use-cases/atualizar-produto.use-case';
import { DeletarProdutoUseCase } from '../application/use-cases/deletar-produto.use-case';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('produtos')
export class ProdutosController {
  constructor(
    private readonly criarProdutoUseCase: CriarProdutoUseCase,
    private readonly listarProdutosUseCase: ListarProdutosUseCase,
    private readonly buscarProdutoCodigoBarrasUseCase: BuscarProdutoCodigoBarrasUseCase,
    private readonly buscarProdutoPorIdUseCase: BuscarProdutoPorIdUseCase,
    private readonly atualizarProdutoUseCase: AtualizarProdutoUseCase,
    private readonly deletarProdutoUseCase: DeletarProdutoUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProdutoDto) {
    return this.criarProdutoUseCase.execute({ ...dto });
  }

  @Get()
  findAll(@Query('busca') busca?: string) {
    return this.listarProdutosUseCase.execute({ busca });
  }

  @Get('codigo/:codigoBarras')
  findByBarcode(@Param('codigoBarras') codigoBarras: string) {
    return this.buscarProdutoCodigoBarrasUseCase.execute({ codigoBarras });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buscarProdutoPorIdUseCase.execute({ id });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.atualizarProdutoUseCase.execute({ id, ...dto });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.deletarProdutoUseCase.execute({ id });
  }
}
