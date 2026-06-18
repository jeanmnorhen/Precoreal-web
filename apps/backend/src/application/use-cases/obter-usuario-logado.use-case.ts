import { Injectable, Inject } from '@nestjs/common';
import { USUARIO_REPOSITORY, Usuario } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';

@Injectable()
export class ObterUsuarioLogadoUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(input: { userId: string }) {
    const data = await this.usuarioRepository.findById(input.userId);
    if (!data) return null;

    const user = new Usuario(data);
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      saldoCreditos: user.saldoCreditos,
      quantidadeDiamantes: user.quantidadeDiamantes,
      criadoEm: user.criadoEm,
    };
  }
}
