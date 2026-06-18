import { Controller, Post, Body } from '@nestjs/common';
import { ProcessarScanUseCase } from '../application/use-cases/processar-scan.use-case';
import { ScanResultDto } from './dto/scan-result.dto';

@Controller('scanner')
export class ScannerController {
  constructor(
    private readonly processarScanUseCase: ProcessarScanUseCase,
  ) {}

  @Post('resultado')
  async scanResult(@Body() dto: ScanResultDto) {
    return this.processarScanUseCase.execute({
      codigoBarras: dto.codigoBarras,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }
}
