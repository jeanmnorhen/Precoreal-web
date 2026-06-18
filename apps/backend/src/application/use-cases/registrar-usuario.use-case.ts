import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USUARIO_REPOSITORY, Usuario } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';
import { ConflictError } from '../errors/conflict.error';
import type { JwtPayload } from '../../auth/guards/jwt-auth.guard';

@Injectable()
export class RegistrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: { nome: string; email: string; senha: string; tipo: 'consumidor' | 'lojista' }) {
    const existing = await this.usuarioRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(input.senha, 10);

    const data = await this.usuarioRepository.create({
      nome: input.nome,
      email: input.email,
      senhaHash,
      tipo: input.tipo,
      saldoCreditos: 0,
      quantidadeDiamantes: 0,
    });

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
