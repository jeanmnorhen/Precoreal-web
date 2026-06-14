import { Module } from '@nestjs/common';
import { GeocachingService } from './geocaching.service';
import { GeoController } from './geo.controller';

@Module({
  controllers: [GeoController],
  providers: [GeocachingService],
  exports: [GeocachingService],
})
export class GeoModule {}
