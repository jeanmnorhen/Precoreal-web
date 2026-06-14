import { Module } from '@nestjs/common';
import { GeocachingService } from './geocaching.service';

@Module({
  providers: [GeocachingService],
  exports: [GeocachingService],
})
export class GeoModule {}
