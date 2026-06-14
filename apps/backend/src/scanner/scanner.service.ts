import { Injectable, NotFoundException } from '@nestjs/common';
import { ProdutosService } from '../produtos/produtos.service';
import { GeocachingService } from '../geo/geocaching.service';
import { GS1ApplicationParser } from '@precoreal/shared';
import { ScanResultDto } from './dto/scan-result.dto';

@Injectable()
export class ScannerService {
  constructor(
    private readonly produtosService: ProdutosService,
    private readonly geocachingService: GeocachingService,
  ) {}

  async processar(dto: ScanResultDto) {
    const parsed = GS1ApplicationParser.parse(dto.codigoBarras);
    const produto = await this.produtosService.findByCodigoBarras(parsed.gtin);

    if (!produto) {
      throw new NotFoundException(
        'Produto não encontrado. Sugira cadastrá-lo.',
      );
    }

    let ofertasProximas = null;
    if (dto.latitude && dto.longitude) {
      ofertasProximas = await this.geocachingService.getNearbyAnuncios(
        dto.latitude,
        dto.longitude,
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
