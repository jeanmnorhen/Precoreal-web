import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class UpdateProdutoDto {
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
