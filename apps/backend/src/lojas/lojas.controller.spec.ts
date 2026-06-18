import { Test, TestingModule } from '@nestjs/testing';
import { LojasController } from './lojas.controller';
import { CriarLojaUseCase } from '../application/use-cases/criar-loja.use-case';
import { ObterPerfilPublicoLojaUseCase } from '../application/use-cases/obter-perfil-publico-loja.use-case';
import { ListarLojasProprietarioUseCase } from '../application/use-cases/listar-lojas-proprietario.use-case';
import { BuscarLojaPorIdUseCase } from '../application/use-cases/buscar-loja-por-id.use-case';
import { AtualizarLojaUseCase } from '../application/use-cases/atualizar-loja.use-case';
import { DeletarLojaUseCase } from '../application/use-cases/deletar-loja.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('LojasController', () => {
  let controller: LojasController;

  const mockCriarLojaUseCase = { execute: jest.fn() };
  const mockPerfilPublicoUseCase = { execute: jest.fn() };
  const mockListarProprietarioUseCase = { execute: jest.fn() };
  const mockBuscarLojaUseCase = { execute: jest.fn() };
  const mockAtualizarLojaUseCase = { execute: jest.fn() };
  const mockDeletarLojaUseCase = { execute: jest.fn() };

  const user = { userId: 'user1', email: 'a@b.com', tipo: 'lojista' as const };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LojasController],
      providers: [
        { provide: CriarLojaUseCase, useValue: mockCriarLojaUseCase },
        { provide: ObterPerfilPublicoLojaUseCase, useValue: mockPerfilPublicoUseCase },
        { provide: ListarLojasProprietarioUseCase, useValue: mockListarProprietarioUseCase },
        { provide: BuscarLojaPorIdUseCase, useValue: mockBuscarLojaUseCase },
        { provide: AtualizarLojaUseCase, useValue: mockAtualizarLojaUseCase },
        { provide: DeletarLojaUseCase, useValue: mockDeletarLojaUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .compile();

    controller = module.get<LojasController>(LojasController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create() deve chamar CriarLojaUseCase', async () => {
    const dto = {
      nome: 'Loja',
      enderecoRua: 'Rua',
      enderecoNumero: '1',
      enderecoBairro: 'Centro',
      enderecoCidade: 'SP',
      enderecoEstado: 'SP',
      enderecoCep: '01001000',
      latitude: '-23.5',
      longitude: '-46.6',
    };
    mockCriarLojaUseCase.execute.mockResolvedValue({ id: '1', nome: 'Loja' });

    const result = await controller.create(user, dto);

    expect(mockCriarLojaUseCase.execute).toHaveBeenCalledWith({ usuarioId: 'user1', ...dto });
    expect(result.id).toBe('1');
  });

  it('listarMinhas() deve chamar ListarLojasProprietarioUseCase', async () => {
    mockListarProprietarioUseCase.execute.mockResolvedValue([{ id: 'loja1' }]);

    const result = await controller.listarMinhas(user);

    expect(mockListarProprietarioUseCase.execute).toHaveBeenCalledWith({ usuarioId: 'user1' });
    expect(result).toHaveLength(1);
  });

  it('findPublic() chama ObterPerfilPublicoLojaUseCase', async () => {
    mockPerfilPublicoUseCase.execute.mockResolvedValue({ id: 'loja1', nome: 'Loja', anuncios: [] });

    const result = await controller.findPublic('loja1');

    expect(mockPerfilPublicoUseCase.execute).toHaveBeenCalledWith({ lojaId: 'loja1' });
    expect(result.nome).toBe('Loja');
  });

  it('findOne() deve chamar BuscarLojaPorIdUseCase', async () => {
    mockBuscarLojaUseCase.execute.mockResolvedValue({ id: 'loja1' });

    const result = await controller.findOne('loja1');

    expect(mockBuscarLojaUseCase.execute).toHaveBeenCalledWith({ id: 'loja1' });
    expect(result.id).toBe('loja1');
  });

  it('update() deve chamar AtualizarLojaUseCase', async () => {
    const dto = { nome: 'Atualizada' };
    mockAtualizarLojaUseCase.execute.mockResolvedValue({ id: 'loja1', nome: 'Atualizada' });

    const result = await controller.update('loja1', user, dto);

    expect(mockAtualizarLojaUseCase.execute).toHaveBeenCalledWith({ id: 'loja1', usuarioId: 'user1', ...dto });
    expect(result.nome).toBe('Atualizada');
  });

  it('remove() deve chamar DeletarLojaUseCase', async () => {
    mockDeletarLojaUseCase.execute.mockResolvedValue({ id: 'loja1' });

    const result = await controller.remove('loja1', user);

    expect(mockDeletarLojaUseCase.execute).toHaveBeenCalledWith({ id: 'loja1', usuarioId: 'user1' });
    expect(result.id).toBe('loja1');
  });
});
