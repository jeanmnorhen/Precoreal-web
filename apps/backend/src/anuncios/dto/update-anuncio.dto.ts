import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class UpdateAnuncioDto {
  @IsString()
  @IsOptional()
  produtoId?: string;

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  raioAlcanceKm?: number;

  @IsNumber()
  @IsOptional()
  custoCreditos?: number;

  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsEnum(['ativo', 'pausado', 'expirado'])
  @IsOptional()
  status?: 'ativo' | 'pausado' | 'expirado';
}
