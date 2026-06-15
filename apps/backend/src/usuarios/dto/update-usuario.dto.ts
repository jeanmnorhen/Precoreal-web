import { IsString, MinLength, IsOptional } from 'class-validator';
import type { UpdateUsuarioRequest } from '@precoreal/api-contracts';

export class UpdateUsuarioDto implements UpdateUsuarioRequest {
  @IsString()
  @MinLength(2)
  @IsOptional()
  nome?: string;
}
