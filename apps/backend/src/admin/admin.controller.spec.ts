import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockService = {
    dashboard: jest.fn(),
    monitoramentoPrecos: jest.fn(),
    monitoramentoUso: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .overrideGuard(AdminGuard).useValue(mockGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar dashboard()', async () => {
    mockService.dashboard.mockResolvedValue({ totalOfertas: 10 });
    const user = { userId: '1', email: 'admin@test.com', tipo: 'admin' as const };
    const result = await controller.dashboard(user);
    expect(result).toEqual({ totalOfertas: 10 });
    expect(mockService.dashboard).toHaveBeenCalled();
  });

  it('deve chamar monitoramentoPrecos() sem filtros', async () => {
    mockService.monitoramentoPrecos.mockResolvedValue({ pontos: [] });
    const result = await controller.monitoramentoPrecos();
    expect(result).toEqual({ pontos: [] });
    expect(mockService.monitoramentoPrecos).toHaveBeenCalledWith(undefined, undefined, undefined);
  });

  it('deve chamar monitoramentoPrecos() com filtros', async () => {
    mockService.monitoramentoPrecos.mockResolvedValue({ pontos: [{ data: '2026-06-01', precoMedio: 1500, regiao: 'SP' }] });
    const result = await controller.monitoramentoPrecos('prod-1', 'SP', '7d');
    expect(result.pontos).toHaveLength(1);
    expect(mockService.monitoramentoPrecos).toHaveBeenCalledWith('prod-1', 'SP', '7d');
  });

  it('deve chamar monitoramentoUso()', async () => {
    mockService.monitoramentoUso.mockResolvedValue({ volumeBuscas: [], produtosMaisBuscados: [] });
    const result = await controller.monitoramentoUso();
    expect(result).toBeDefined();
    expect(mockService.monitoramentoUso).toHaveBeenCalledWith(undefined);
  });

  it('deve chamar monitoramentoUso() com período', async () => {
    mockService.monitoramentoUso.mockResolvedValue({ volumeBuscas: [], produtosMaisBuscados: [] });
    const result = await controller.monitoramentoUso('30d');
    expect(mockService.monitoramentoUso).toHaveBeenCalledWith('30d');
  });
});
