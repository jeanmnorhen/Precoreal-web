import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import type { CreateLojaRequest } from '@precoreal/api-contracts';

export class CreateLojaDto implements CreateLojaRequest {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  enderecoRua: string;

  @IsString()
  enderecoNumero: string;

  @IsString()
  enderecoBairro: string;

  @IsString()
  enderecoCidade: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  enderecoEstado: string;

  @IsString()
  @MinLength(8)
  @MaxLength(8)
  enderecoCep: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  tabloideUrl?: string;
}
