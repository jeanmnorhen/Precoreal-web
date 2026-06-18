import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { HealthService } from '../health/health.service';
import { TestRunnerService } from '../test-runner/test-runner.service';
import { ObterDashboardAdminUseCase } from '../application/use-cases/obter-dashboard-admin.use-case';
import { MonitorarPrecosUseCase } from '../application/use-cases/monitorar-precos.use-case';
import { MonitorarUsoUseCase } from '../application/use-cases/monitorar-uso.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('AdminController', () => {
  let controller: AdminController;

  const mockHealthService = { observabilidade: jest.fn() };
  const mockTestRunnerService = { executarTestes: jest.fn() };
  const mockDashboardUseCase = { execute: jest.fn() };
  const mockPrecosUseCase = { execute: jest.fn() };
  const mockUsoUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: HealthService, useValue: mockHealthService },
        { provide: TestRunnerService, useValue: mockTestRunnerService },
        { provide: ObterDashboardAdminUseCase, useValue: mockDashboardUseCase },
        { provide: MonitorarPrecosUseCase, useValue: mockPrecosUseCase },
        { provide: MonitorarUsoUseCase, useValue: mockUsoUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .overrideGuard(AdminGuard).useValue(mockGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar dashboard() via use case', async () => {
    mockDashboardUseCase.execute.mockResolvedValue({ totalOfertas: 10 });
    const result = await controller.dashboard();
    expect(result).toEqual({ totalOfertas: 10 });
    expect(mockDashboardUseCase.execute).toHaveBeenCalled();
  });

  it('deve chamar monitoramentoPrecos() sem filtros', async () => {
    mockPrecosUseCase.execute.mockResolvedValue({ pontos: [] });
    const result = await controller.monitoramentoPrecos();
    expect(result).toEqual({ pontos: [] });
    expect(mockPrecosUseCase.execute).toHaveBeenCalledWith({ produtoId: undefined, regiao: undefined });
  });

  it('deve chamar monitoramentoPrecos() com filtros', async () => {
    mockPrecosUseCase.execute.mockResolvedValue({ pontos: [{ data: '2026-06-01', precoMedio: 1500, regiao: 'SP' }] });
    const result = await controller.monitoramentoPrecos('prod-1', 'SP', '7d');
    expect(result.pontos).toHaveLength(1);
    expect(mockPrecosUseCase.execute).toHaveBeenCalledWith({ produtoId: 'prod-1', regiao: 'SP' });
  });

  it('deve chamar monitoramentoUso() via use case', async () => {
    mockUsoUseCase.execute.mockResolvedValue({ volumeBuscas: [], produtosMaisBuscados: [] });
    const result = await controller.monitoramentoUso();
    expect(result).toBeDefined();
    expect(mockUsoUseCase.execute).toHaveBeenCalled();
  });

  it('deve chamar observabilidade() via HealthService', async () => {
    const mockResult = {
      health: { status: 'healthy', uptime: 3600, timestamp: new Date().toISOString(), servicos: {} },
      filas: [],
      erros: { erros: [], total: 0 },
    };
    mockHealthService.observabilidade.mockResolvedValue(mockResult);
    const result = await controller.observabilidade();
    expect(result.health.status).toBe('healthy');
    expect(mockHealthService.observabilidade).toHaveBeenCalled();
  });

  it('deve chamar executarTestes() via TestRunnerService', async () => {
    const mockResult = {
      unit: { numPassedSuites: 16, numFailedSuites: 0, numPassedTests: 109, numFailedTests: 0, suites: [], duration: 14000 },
      e2e: { numPassedSuites: 1, numFailedSuites: 0, numPassedTests: 18, numFailedTests: 0, suites: [], duration: 9000 },
      coverage: { lines: 85, statements: 82, functions: 78, branches: 70 },
    };
    mockTestRunnerService.executarTestes.mockResolvedValue(mockResult);

    const result = await controller.executarTestes();

    expect(result.unit.numPassedTests).toBe(109);
    expect(result.coverage.lines).toBe(85);
  });
});
