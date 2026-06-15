import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import type { UpdateProdutoRequest } from '@precoreal/api-contracts';

export class UpdateProdutoDto implements UpdateProdutoRequest {
  @IsString()
  @IsOptional()
  codigoBarras?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsNumber()
  @IsOptional()
  precoMedio?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  listaImagens?: string[];
}
