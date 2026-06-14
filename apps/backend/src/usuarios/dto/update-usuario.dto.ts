import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  nome?: string;
}
