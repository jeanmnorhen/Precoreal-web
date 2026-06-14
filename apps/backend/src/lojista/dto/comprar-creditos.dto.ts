import { IsString, IsNumber, Min } from 'class-validator';

export class ComprarCreditosDto {
  @IsNumber()
  @Min(100)
  valorCentavos: number;

  @IsString()
  lojaId: string;
}
