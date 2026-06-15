import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GeocachingService } from './geocaching.service';

const TIPOS_VALIDOS = ['oferta', 'promocao', 'promocao_relampago'] as const;

@Controller('anuncios')
export class GeoController {
  constructor(private readonly geocachingService: GeocachingService) {}

  @Get('proximos')
  async proximos(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('tipo') tipo?: string,
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return { error: 'Parâmetros latitude e longitude são obrigatórios.' };
    }

    if (tipo && !TIPOS_VALIDOS.includes(tipo as any)) {
      throw new BadRequestException(
        `tipo inválido: "${tipo}". Valores aceitos: ${TIPOS_VALIDOS.join(', ')}`,
      );
    }

    return this.geocachingService.getNearbyAnuncios(lat, lng, tipo);
  }
}
