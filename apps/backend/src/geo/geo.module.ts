import { Module } from '@nestjs/common';
import { GeocachingService } from './geocaching.service';
import { GeoController } from './geo.controller';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [GeoController],
  providers: [GeocachingService],
  exports: [GeocachingService],
})
export class GeoModule {}
