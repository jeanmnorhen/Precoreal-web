import { Controller, Get, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { CosmosService } from './cosmos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LojistaGuard } from '../lojista/lojista.guard';
import type { CosmosProdutoSugerido } from '@precoreal/api-contracts';

@Controller('cosmos')
export class CosmosController {
  constructor(private readonly cosmosService: CosmosService) {}

  @Get('gtins/:codigoBarras')
  @UseGuards(JwtAuthGuard, LojistaGuard)
  async buscarPorGtin(@Param('codigoBarras') codigoBarras: string): Promise<CosmosProdutoSugerido | null> {
    const raw = await this.cosmosService.buscarPorGtin(codigoBarras);
    if (!raw) return null;

    return {
      codigoBarras: raw.gtin,
      nome: raw.description,
      marca: raw.brand?.name || '',
      categoria: raw.gpc?.description || '',
      ncm: raw.ncm?.code,
      precoMedio: raw.price_min ? Math.round((raw.price_min + (raw.price_max || raw.price_min)) / 2 * 100) : undefined,
      imagemUrl: raw.thumbnail || undefined,
    };
  }

  @Post('busca')
  @UseGuards(JwtAuthGuard, LojistaGuard)
  async buscarPorNome(@Body() body: { termo: string }): Promise<{ produtos: CosmosProdutoSugerido[] }> {
    const rawList = await this.cosmosService.pesquisarPorNome(body.termo);

    const produtos = rawList.map((raw) => ({
      codigoBarras: raw.gtin,
      nome: raw.description,
      marca: raw.brand?.name || '',
      categoria: raw.gpc?.description || '',
      ncm: raw.ncm?.code,
      precoMedio: raw.price_min ? Math.round((raw.price_min + (raw.price_max || raw.price_min)) / 2 * 100) : undefined,
      imagemUrl: raw.thumbnail || undefined,
    }));

    return { produtos };
  }
}
