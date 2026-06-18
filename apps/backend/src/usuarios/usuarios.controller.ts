import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { BuscarUsuarioPorIdUseCase } from '../application/use-cases/buscar-usuario-por-id.use-case';
import { AtualizarUsuarioUseCase } from '../application/use-cases/atualizar-usuario.use-case';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(
    private readonly buscarUsuarioPorIdUseCase: BuscarUsuarioPorIdUseCase,
    private readonly atualizarUsuarioUseCase: AtualizarUsuarioUseCase,
  ) {}

  @Get('perfil')
  async perfil(@CurrentUser() user: JwtPayload) {
    return this.buscarUsuarioPorIdUseCase.execute({ id: user.userId });
  }

  @Patch('perfil')
  async atualizarPerfil(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.atualizarUsuarioUseCase.execute({ id: user.userId, data: dto as any });
  }
}
