import { Module } from '@nestjs/common';
import { ScannerController } from './scanner.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [ScannerController],
})
export class ScannerModule {}
