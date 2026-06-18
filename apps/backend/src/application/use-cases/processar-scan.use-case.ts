import { Injectable, Inject } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';
import { GS1ApplicationParser } from '@precoreal/shared';
import { GeocachingService } from '../../geo/geocaching.service';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class ProcessarScanUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepository: IProdutoRepository,
    private readonly geocachingService: GeocachingService,
  ) {}

  async execute(input: {
    codigoBarras: string;
    latitude?: number;
    longitude?: number;
  }) {
    const parsed = GS1ApplicationParser.parse(input.codigoBarras);
    const produto = await this.produtoRepository.findByCodigoBarras(parsed.gtin);

    if (!produto) {
      throw new NotFoundError('Produto não encontrado. Sugira cadastrá-lo.');
    }

    let ofertasProximas = null;
    if (input.latitude && input.longitude) {
      ofertasProximas = await this.geocachingService.getNearbyAnuncios(
        input.latitude,
        input.longitude,
      );
    }

    return {
      produto,
      informacoesExtras: {
        lote: parsed.lote || null,
        validade: parsed.validade || null,
      },
      ofertasProximas:
        ofertasProximas?.filter((a) => a.codigoBarras === parsed.gtin) || [],
    };
  }
}
