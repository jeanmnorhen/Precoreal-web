import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { UpdateTurnosRequest, Turno } from '@precoreal/api-contracts';

class TurnoDto implements Turno {
  @IsNumber()
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFim: string;
}

export class UpdateTurnosDto implements UpdateTurnosRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TurnoDto)
  turnos: TurnoDto[];
}
