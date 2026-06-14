import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ScanResultDto {
  @IsString()
  codigoBarras: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
