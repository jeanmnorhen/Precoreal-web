import { Injectable, Inject } from '@nestjs/common';
import {
  FUNCIONARIO_LOJA_REPOSITORY, LOJA_REPOSITORY,
} from '@precoreal/domain';
import type {
  IFuncionarioLojaRepository, ILojaRepository,
} from '@precoreal/domain';

@Injectable()
export class ListarLojasFuncionarioUseCase {
  constructor(
    @Inject(FUNCIONARIO_LOJA_REPOSITORY) private readonly funcionarioLojaRepo: IFuncionarioLojaRepository,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepo: ILojaRepository,
  ) {}

  async execute(input: { usuarioId: string }) {
    const vinculos = await this.funcionarioLojaRepo.findByUsuarioId(input.usuarioId);
    const lojas = await Promise.all(
      vinculos.map((v) => this.lojaRepo.findById(v.lojaId)),
    );
    return lojas.filter(Boolean).map((l) => ({
      id: l!.id,
      nome: l!.nome,
      enderecoCidade: l!.enderecoCidade,
      enderecoEstado: l!.enderecoEstado,
    }));
  }
}
