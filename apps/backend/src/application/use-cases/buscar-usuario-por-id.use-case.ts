import { Injectable, Inject } from '@nestjs/common';
import { USUARIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository, UsuarioData } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class BuscarUsuarioPorIdUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(input: { id: string }): Promise<UsuarioData> {
    const user = await this.usuarioRepository.findById(input.id);
    if (!user) throw new NotFoundError('Usuário não encontrado.');
    return user;
  }
}
