import { Controller, Get, Query } from '@nestjs/common';
import { GeocachingService } from './geocaching.service';

@Controller('anuncios')
export class GeoController {
  constructor(private readonly geocachingService: GeocachingService) {}

  @Get('proximos')
  async proximos(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return { error: 'Parâmetros latitude e longitude são obrigatórios.' };
    }

    return this.geocachingService.getNearbyAnuncios(lat, lng);
  }
}
