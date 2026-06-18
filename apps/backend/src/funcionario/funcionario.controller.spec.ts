import { Test, TestingModule } from '@nestjs/testing';
import { FuncionarioController } from './funcionario.controller';
import { VerificarAcessoFuncionarioUseCase } from '../application/use-cases/verificar-acesso-funcionario.use-case';
import { ListarLojasFuncionarioUseCase } from '../application/use-cases/listar-lojas-funcionario.use-case';
import { ListarProdutosLojaUseCase } from '../application/use-cases/listar-produtos-loja.use-case';
import { ListarAnunciosLojaUseCase } from '../application/use-cases/listar-anuncios-loja.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FuncionarioGuard } from './funcionario.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('FuncionarioController', () => {
  let controller: FuncionarioController;

  const mockVerificarAcessoUseCase = { execute: jest.fn() };
  const mockListarLojasUseCase = { execute: jest.fn() };
  const mockListarProdutosUseCase = { execute: jest.fn() };
  const mockListarAnunciosUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuncionarioController],
      providers: [
        { provide: VerificarAcessoFuncionarioUseCase, useValue: mockVerificarAcessoUseCase },
        { provide: ListarLojasFuncionarioUseCase, useValue: mockListarLojasUseCase },
        { provide: ListarProdutosLojaUseCase, useValue: mockListarProdutosUseCase },
        { provide: ListarAnunciosLojaUseCase, useValue: mockListarAnunciosUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .overrideGuard(FuncionarioGuard).useValue(mockGuard)
      .compile();

    controller = module.get<FuncionarioController>(FuncionarioController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarLojas', () => {
    it('deve delegar ao use case', async () => {
      const mockLojas = [{ id: 'loja1', nome: 'Loja Teste', enderecoCidade: 'Santos', enderecoEstado: 'SP' }];
      mockListarLojasUseCase.execute.mockResolvedValue(mockLojas);

      const user = { userId: 'user-1', email: 'func@test.com', tipo: 'funcionario' as const };
      const result = await controller.listarLojas(user);

      expect(result).toEqual(mockLojas);
      expect(mockListarLojasUseCase.execute).toHaveBeenCalledWith({ usuarioId: 'user-1' });
    });
  });

  describe('verificarAcesso', () => {
    it('deve chamar use case', async () => {
      const user = { userId: 'user-1', email: 'func@test.com', tipo: 'funcionario' as const };
      const dto = { latitude: -23.94, longitude: -46.34 };
      mockVerificarAcessoUseCase.execute.mockResolvedValue({ acessoPermitido: true });

      const result = await controller.verificarAcesso(user, 'loja-1', dto);

      expect(result).toEqual({ acessoPermitido: true });
      expect(mockVerificarAcessoUseCase.execute).toHaveBeenCalledWith({
        usuarioId: 'user-1',
        lojaId: 'loja-1',
        latitude: -23.94,
        longitude: -46.34,
      });
    });
  });

  describe('listarProdutos', () => {
    it('deve delegar ao use case', async () => {
      const mockResult = [{ id: 'p1', nome: 'Prod X' }];
      mockListarProdutosUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.listarProdutos('loja-1');

      expect(result).toHaveLength(1);
      expect(mockListarProdutosUseCase.execute).toHaveBeenCalledWith({ lojaId: 'loja-1' });
    });
  });

  describe('listarAnuncios', () => {
    it('deve delegar ao use case', async () => {
      const mockResult = [{ id: 'a1', titulo: 'Oferta' }];
      mockListarAnunciosUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.listarAnuncios('loja-1');

      expect(result).toHaveLength(1);
      expect(mockListarAnunciosUseCase.execute).toHaveBeenCalledWith({ lojaId: 'loja-1' });
    });
  });
});
