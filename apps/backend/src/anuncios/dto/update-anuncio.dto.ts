import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import type { UpdateAnuncioRequest } from '@precoreal/api-contracts';

export class UpdateAnuncioDto implements UpdateAnuncioRequest {
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
