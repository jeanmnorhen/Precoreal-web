import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import type { UpdateLojaRequest } from '@precoreal/api-contracts';

export class UpdateLojaDto implements UpdateLojaRequest {
  @IsString()
  @MinLength(2)
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  enderecoRua?: string;

  @IsString()
  @IsOptional()
  enderecoNumero?: string;

  @IsString()
  @IsOptional()
  enderecoBairro?: string;

  @IsString()
  @IsOptional()
  enderecoCidade?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @IsOptional()
  enderecoEstado?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(8)
  @IsOptional()
  enderecoCep?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}
