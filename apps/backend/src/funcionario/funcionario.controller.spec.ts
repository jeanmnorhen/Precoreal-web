import { Test, TestingModule } from '@nestjs/testing';
import { FuncionarioController } from './funcionario.controller';
import { FuncionarioService } from './funcionario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FuncionarioGuard } from './funcionario.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('FuncionarioController', () => {
  let controller: FuncionarioController;
  let service: jest.Mocked<FuncionarioService>;

  const mockFuncionarioService = {
    verificarAcesso: jest.fn(),
    listarLojas: jest.fn(),
    listarProdutos: jest.fn(),
    listarAnuncios: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuncionarioController],
      providers: [
        { provide: FuncionarioService, useValue: mockFuncionarioService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .overrideGuard(FuncionarioGuard).useValue(mockGuard)
      .compile();

    controller = module.get<FuncionarioController>(FuncionarioController);
    service = module.get<FuncionarioService>(FuncionarioService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarLojas', () => {
    it('deve delegar ao service.listarLojas', async () => {
      const mockLojas = [{ id: 'loja1', nome: 'Loja Teste', enderecoCidade: 'Santos', enderecoEstado: 'SP' }];
      mockFuncionarioService.listarLojas.mockResolvedValue(mockLojas);

      const user = { userId: 'user-1', email: 'func@test.com', tipo: 'funcionario' as const };
      const result = await controller.listarLojas(user);

      expect(result).toEqual(mockLojas);
      expect(mockFuncionarioService.listarLojas).toHaveBeenCalledWith('user-1');
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
    it('deve delegar ao service.listarProdutos', async () => {
      const mockResult = [{ produtos: { id: 'p1', nome: 'Prod X' }, anuncios: { id: 'a1' } }];
      mockFuncionarioService.listarProdutos.mockResolvedValue(mockResult);

      const result = await controller.listarProdutos('loja-1');

      expect(result).toHaveLength(1);
      expect(mockFuncionarioService.listarProdutos).toHaveBeenCalledWith('loja-1');
    });
  });

  describe('listarAnuncios', () => {
    it('deve delegar ao service.listarAnuncios', async () => {
      const mockResult = [{ anuncios: { id: 'a1', titulo: 'Oferta' }, lojas: { nome: 'Loja X' } }];
      mockFuncionarioService.listarAnuncios.mockResolvedValue(mockResult);

      const result = await controller.listarAnuncios('loja-1');

      expect(result).toHaveLength(1);
      expect(mockFuncionarioService.listarAnuncios).toHaveBeenCalledWith('loja-1');
    });
  });
});
