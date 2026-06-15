import { Test, TestingModule } from '@nestjs/testing';
import { FuncionarioController } from './funcionario.controller';
import { FuncionarioService } from './funcionario.service';
import { DatabaseService } from '../db/database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FuncionarioGuard } from './funcionario.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

const makeQuery = (result: any) => {
  const q: any = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: (resolve: any) => resolve(result),
  };
  return q;
};

describe('FuncionarioController', () => {
  let controller: FuncionarioController;
  let service: FuncionarioService;
  let currentQuery: any;

  const mockFuncionarioService = {
    verificarAcesso: jest.fn(),
  };

  const mockDb = {
    select: jest.fn(() => currentQuery),
  };

  beforeEach(async () => {
    currentQuery = makeQuery([]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuncionarioController],
      providers: [
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: DatabaseService, useValue: { get database() { return mockDb; } } },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .overrideGuard(FuncionarioGuard).useValue(mockGuard)
      .compile();

    controller = module.get<FuncionarioController>(FuncionarioController);
    service = module.get<FuncionarioService>(FuncionarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarLojas', () => {
    it('deve retornar lista de lojas do funcionário', async () => {
      const mockLojas = [{ id: 'loja1', nome: 'Loja Teste', enderecoCidade: 'Santos', enderecoEstado: 'SP' }];
      currentQuery.then = (resolve: any) => resolve(mockLojas);

      const user = { userId: 'user-1', email: 'func@test.com', tipo: 'funcionario' as const };
      const result = await controller.listarLojas(user);

      expect(result).toEqual(mockLojas);
    });
  });

  describe('verificarAcesso', () => {
    it('deve chamar service.verificarAcesso', async () => {
      const user = { userId: 'user-1', email: 'func@test.com', tipo: 'funcionario' as const };
      const dto = { latitude: -23.94, longitude: -46.34 };
      mockFuncionarioService.verificarAcesso.mockResolvedValue({ acessoPermitido: true });

      const result = await controller.verificarAcesso(user, 'loja-1', dto);

      expect(result).toEqual({ acessoPermitido: true });
      expect(mockFuncionarioService.verificarAcesso).toHaveBeenCalledWith('user-1', 'loja-1', -23.94, -46.34);
    });
  });

  describe('listarProdutos', () => {
    it('deve retornar produtos da loja', async () => {
      const mockResult = [{ produtos: { id: 'p1', nome: 'Prod X' }, anuncios: { id: 'a1' } }];
      currentQuery.then = (resolve: any) => resolve(mockResult);

      const result = await controller.listarProdutos('loja-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('listarAnuncios', () => {
    it('deve retornar anúncios ativos da loja', async () => {
      const mockResult = [{ anuncios: { id: 'a1', titulo: 'Oferta' }, lojas: { nome: 'Loja X' } }];
      currentQuery.then = (resolve: any) => resolve(mockResult);

      const result = await controller.listarAnuncios('loja-1');

      expect(result).toHaveLength(1);
    });
  });
});
