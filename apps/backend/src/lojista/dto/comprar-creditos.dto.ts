import { IsString, IsNumber, Min } from 'class-validator';
import type { ComprarCreditosRequest } from '@precoreal/api-contracts';

export class ComprarCreditosDto implements ComprarCreditosRequest {
  @IsNumber()
  @Min(100)
  valorCentavos: number;

  @IsString()
  lojaId: string;
}
