import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import type { RegisterRequest } from '@precoreal/api-contracts';

export class RegisterDto implements RegisterRequest {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(['consumidor', 'lojista'])
  tipo: 'consumidor' | 'lojista';
}
