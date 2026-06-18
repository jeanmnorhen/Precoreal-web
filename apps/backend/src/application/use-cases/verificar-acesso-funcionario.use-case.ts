import { Injectable, Inject } from '@nestjs/common';
import {
  FUNCIONARIO_LOJA_REPOSITORY, LOJA_REPOSITORY,
} from '@precoreal/domain';
import type {
  IFuncionarioLojaRepository, ILojaRepository,
} from '@precoreal/domain';
import { FuncionarioLoja } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class VerificarAcessoFuncionarioUseCase {
  constructor(
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepo: IFuncionarioLojaRepository,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepo: ILojaRepository,
  ) {}

  async execute(input: {
    usuarioId: string;
    lojaId: string;
    latitude: number;
    longitude: number;
  }) {
    const vinculo = await this.funcionarioLojaRepo.findVinculo(input.usuarioId, input.lojaId);
    if (!vinculo) {
      throw new NotFoundError('Vínculo de funcionário não encontrado.');
    }

    const loja = await this.lojaRepo.findById(input.lojaId);
    if (!loja) {
      throw new NotFoundError('Loja não encontrada.');
    }

    const agora = new Date();
    let horarioValido = false;
    try {
      horarioValido = new FuncionarioLoja(vinculo).estaNoHorario(agora);
    } catch {
      // turnos inválidos — acesso negado
    }

    const dentroPerimetro = await this.lojaRepo.checkGeofence(input.lojaId, input.latitude, input.longitude);
    const acessoPermitido = horarioValido && dentroPerimetro;

    return {
      acessoPermitido,
      mensagem: acessoPermitido
        ? 'Acesso permitido. Você está no horário e local de trabalho.'
        : 'Acesso negado. Verifique se está no perímetro da loja e em seu horário de trabalho.',
      lojaId: input.lojaId,
      lojaNome: loja.nome,
      dentoPerimetro: dentroPerimetro,
      horarioValido,
    };
  }
}
