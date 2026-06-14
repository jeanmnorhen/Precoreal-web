import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateProdutoDto {
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
