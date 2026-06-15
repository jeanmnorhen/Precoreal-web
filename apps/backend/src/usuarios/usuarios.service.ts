import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USUARIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async findById(id: string) {
    const user = await this.usuarioRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const user = await this.usuarioRepository.update(id, dto as any);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}
