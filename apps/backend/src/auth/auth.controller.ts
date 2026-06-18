import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RegistrarUsuarioUseCase } from '../application/use-cases/registrar-usuario.use-case';
import { AutenticarUsuarioUseCase } from '../application/use-cases/autenticar-usuario.use-case';
import { ObterUsuarioLogadoUseCase } from '../application/use-cases/obter-usuario-logado.use-case';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private readonly autenticarUsuarioUseCase: AutenticarUsuarioUseCase,
    private readonly obterUsuarioLogadoUseCase: ObterUsuarioLogadoUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registrarUsuarioUseCase.execute({
      nome: dto.nome,
      email: dto.email,
      senha: dto.senha,
      tipo: dto.tipo,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.autenticarUsuarioUseCase.execute({
      email: dto.email,
      senha: dto.senha,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload) {
    return this.obterUsuarioLogadoUseCase.execute({ userId: user.userId });
  }
}
