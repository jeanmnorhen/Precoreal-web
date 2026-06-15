import { IsString, IsNumber, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { AddFuncionarioRequest, Turno } from '@precoreal/api-contracts';

class TurnoDto implements Turno {
  @IsNumber()
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFim: string;
}

export class AddFuncionarioDto implements AddFuncionarioRequest {
  @IsEmail()
  email: string;

  @IsString()
  lojaId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TurnoDto)
  turnos: TurnoDto[];
}
