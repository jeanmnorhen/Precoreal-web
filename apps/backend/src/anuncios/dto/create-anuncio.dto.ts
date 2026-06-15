import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import type { CreateAnuncioRequest } from '@precoreal/api-contracts';

export class CreateAnuncioDto implements CreateAnuncioRequest {
  @IsString()
  produtoId: string;

  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  raioAlcanceKm: number;

  @IsNumber()
  custoCreditos: number;

  @IsDateString()
  dataInicio: string;

  @IsDateString()
  dataFim: string;
}
