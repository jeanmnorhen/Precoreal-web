import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { HealthService } from '../health/health.service';
import { TestRunnerService } from '../test-runner/test-runner.service';
import { ObterDashboardAdminUseCase } from '../application/use-cases/obter-dashboard-admin.use-case';
import { MonitorarPrecosUseCase } from '../application/use-cases/monitorar-precos.use-case';
import { MonitorarUsoUseCase } from '../application/use-cases/monitorar-uso.use-case';
import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly healthService: HealthService,
    private readonly testRunnerService: TestRunnerService,
    private readonly obterDashboardAdminUseCase: ObterDashboardAdminUseCase,
    private readonly monitorarPrecosUseCase: MonitorarPrecosUseCase,
    private readonly monitorarUsoUseCase: MonitorarUsoUseCase,
  ) {}

  @Get('observabilidade')
  async observabilidade() {
    return this.healthService.observabilidade();
  }

  @Get('dashboard')
  async dashboard() {
    return this.obterDashboardAdminUseCase.execute();
  }

  @Get('precos')
  async monitoramentoPrecos(
    @Query('produtoId') produtoId?: string,
    @Query('regiao') regiao?: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.monitorarPrecosUseCase.execute({ produtoId, regiao });
  }

  @Get('uso')
  async monitoramentoUso(@Query('periodo') periodo?: string) {
    return this.monitorarUsoUseCase.execute();
  }

  @Post('testes/executar')
  async executarTestes() {
    return this.testRunnerService.executarTestes();
  }
}
