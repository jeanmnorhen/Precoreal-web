import { Controller, Post, Body } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScanResultDto } from './dto/scan-result.dto';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('resultado')
  async scanResult(@Body() dto: ScanResultDto) {
    return this.scannerService.processar(dto);
  }
}
