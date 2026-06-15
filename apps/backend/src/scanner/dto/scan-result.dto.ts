import { IsString, IsOptional, IsNumber } from 'class-validator';
import type { ScanResultRequest } from '@precoreal/api-contracts';

export class ScanResultDto implements ScanResultRequest {
  @IsString()
  codigoBarras: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
