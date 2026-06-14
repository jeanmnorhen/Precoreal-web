import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  async perfil(@CurrentUser() user: JwtPayload) {
    return this.usuariosService.findById(user.userId);
  }

  @Patch('perfil')
  async atualizarPerfil(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(user.userId, dto);
  }
}
