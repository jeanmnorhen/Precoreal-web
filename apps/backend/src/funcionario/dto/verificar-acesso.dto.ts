import { IsNumber } from 'class-validator';
import type { VerificarAcessoRequest } from '@precoreal/api-contracts';

export class VerificarAcessoDto implements VerificarAcessoRequest {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
