import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USUARIO_REPOSITORY, Usuario } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import type { JwtPayload } from '../../auth/guards/jwt-auth.guard';

@Injectable()
export class AutenticarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: { email: string; senha: string }) {
    const data = await this.usuarioRepository.findByEmail(input.email);
    if (!data) {
      throw new UnauthorizedError('Email ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(input.senha, data.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedError('Email ou senha inválidos.');
    }

    const user = new Usuario(data);
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      tipo: user.tipo,
    };

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
