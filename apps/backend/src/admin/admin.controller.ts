import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async dashboard(@CurrentUser() user: JwtPayload) {
    return this.adminService.dashboard();
  }

  @Get('precos')
  async monitoramentoPrecos(
    @Query('produtoId') produtoId?: string,
    @Query('regiao') regiao?: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.adminService.monitoramentoPrecos(produtoId, regiao, periodo);
  }

  @Get('uso')
  async monitoramentoUso(@Query('periodo') periodo?: string) {
    return this.adminService.monitoramentoUso(periodo);
  }

  @Post('testes/executar')
  async executarTestes() {
    return this.adminService.executarTestes();
  }
}
