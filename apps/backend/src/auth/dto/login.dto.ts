import { IsEmail, IsString } from 'class-validator';
import type { LoginRequest } from '@precoreal/api-contracts';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  senha: string;
}
