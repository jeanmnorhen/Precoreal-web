import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateAnuncioDto {
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
