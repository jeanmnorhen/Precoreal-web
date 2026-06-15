import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import type { CreateProdutoRequest } from '@precoreal/api-contracts';

export class CreateProdutoDto implements CreateProdutoRequest {
  @IsString()
  codigoBarras: string;

  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  categoria: string;

  @IsString()
  marca: string;

  @IsNumber()
  @IsOptional()
  precoMedio?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  listaImagens?: string[];
}
