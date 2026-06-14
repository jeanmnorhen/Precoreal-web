import { Module } from '@nestjs/common';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';
import { ProdutosModule } from '../produtos/produtos.module';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [ProdutosModule, GeoModule],
  controllers: [ScannerController],
  providers: [ScannerService],
})
export class ScannerModule {}
