import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../db/database.service';
import { usuarios } from '@precoreal/shared';
import { eq } from 'drizzle-orm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './guards/jwt-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  async register(dto: RegisterDto) {
    const existing = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const [user] = await this.db
      .insert(usuarios)
      .values({
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        tipo: dto.tipo,
      })
      .returning();

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
    const [user] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, dto.email))
      .limit(1);

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
    const [user] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

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
