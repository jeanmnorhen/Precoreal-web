import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USUARIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './guards/jwt-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usuarioRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.usuarioRepository.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      tipo: dto.tipo,
      saldoCreditos: 0,
      quantidadeDiamantes: 0,
    });

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

  async login(dto: LoginDto) {
    const user = await this.usuarioRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

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

  async me(userId: string) {
    const user = await this.usuarioRepository.findById(userId);
    if (!user) return null;

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
