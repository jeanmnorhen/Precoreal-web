import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LojistaService } from './lojista.service';
import { LojistaGuard } from './lojista.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { ComprarCreditosDto } from './dto/comprar-creditos.dto';

@Controller('lojista')
@UseGuards(JwtAuthGuard, LojistaGuard)
export class LojistaController {
  constructor(private readonly lojistaService: LojistaService) {}

  @Get('dashboard')
  async dashboard(@CurrentUser() user: JwtPayload) {
    return this.lojistaService.dashboard(user.userId);
  }

  @Post('creditos/comprar')
  async comprarCreditos(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ComprarCreditosDto,
  ) {
    return this.lojistaService.comprarCreditos(
      user.userId,
      user.email,
      dto.valorCentavos,
    );
  }
}
