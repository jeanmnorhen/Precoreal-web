import { Test, TestingModule } from '@nestjs/testing';
import { AnunciosController } from './anuncios.controller';
import { CriarAnuncioUseCase } from '../application/use-cases/criar-anuncio.use-case';
import { AtualizarAnuncioUseCase } from '../application/use-cases/atualizar-anuncio.use-case';
import { RenovarAnuncioUseCase } from '../application/use-cases/renovar-anuncio.use-case';
import { ListarAnunciosUseCase } from '../application/use-cases/listar-anuncios.use-case';
import { BuscarAnuncioPorIdUseCase } from '../application/use-cases/buscar-anuncio-por-id.use-case';
import { DeletarAnuncioUseCase } from '../application/use-cases/deletar-anuncio.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('AnunciosController', () => {
  let controller: AnunciosController;

  const mockCriarUseCase = { execute: jest.fn() };
  const mockAtualizarUseCase = { execute: jest.fn() };
  const mockRenovarUseCase = { execute: jest.fn() };
  const mockListarUseCase = { execute: jest.fn() };
  const mockBuscarUseCase = { execute: jest.fn() };
  const mockDeletarUseCase = { execute: jest.fn() };

  const user = { userId: 'user1', email: 'a@b.com', tipo: 'lojista' as const };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnunciosController],
      providers: [
        { provide: CriarAnuncioUseCase, useValue: mockCriarUseCase },
        { provide: AtualizarAnuncioUseCase, useValue: mockAtualizarUseCase },
        { provide: RenovarAnuncioUseCase, useValue: mockRenovarUseCase },
        { provide: ListarAnunciosUseCase, useValue: mockListarUseCase },
        { provide: BuscarAnuncioPorIdUseCase, useValue: mockBuscarUseCase },
        { provide: DeletarAnuncioUseCase, useValue: mockDeletarUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .compile();

    controller = module.get<AnunciosController>(AnunciosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create() deve chamar CriarAnuncioUseCase com dto e user', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta',
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
    };
    mockCriarUseCase.execute.mockResolvedValue({ id: 'a1' });

    const result = await controller.create(dto, user);

    expect(mockCriarUseCase.execute).toHaveBeenCalledWith({ lojaId: '', ...dto });
    expect(result.id).toBe('a1');
  });

  it('findAll() deve chamar ListarAnunciosUseCase', async () => {
    mockListarUseCase.execute.mockResolvedValue([{ id: 'a1' }]);

    const result = await controller.findAll();

    expect(mockListarUseCase.execute).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('findOne() deve chamar BuscarAnuncioPorIdUseCase', async () => {
    mockBuscarUseCase.execute.mockResolvedValue({ id: 'a1' });

    const result = await controller.findOne('a1');

    expect(mockBuscarUseCase.execute).toHaveBeenCalledWith({ id: 'a1' });
    expect(result.id).toBe('a1');
  });

  it('update() deve chamar AtualizarAnuncioUseCase', async () => {
    const dto = { titulo: 'Novo' };
    mockAtualizarUseCase.execute.mockResolvedValue({ id: 'a1', titulo: 'Novo' });

    const result = await controller.update('a1', dto);

    expect(mockAtualizarUseCase.execute).toHaveBeenCalledWith({ id: 'a1', ...dto });
    expect(result!.titulo).toBe('Novo');
  });

  it('remove() deve chamar DeletarAnuncioUseCase', async () => {
    mockDeletarUseCase.execute.mockResolvedValue({ id: 'a1' });

    const result = await controller.remove('a1');

    expect(mockDeletarUseCase.execute).toHaveBeenCalledWith({ id: 'a1' });
    expect(result.id).toBe('a1');
  });

  it('renovar() deve chamar RenovarAnuncioUseCase', async () => {
    mockRenovarUseCase.execute.mockResolvedValue({ anuncio: { id: 'a1' }, creditosRestantes: 10 });

    const result = await controller.renovar('a1', user);

    expect(mockRenovarUseCase.execute).toHaveBeenCalledWith({ anuncioId: 'a1', usuarioId: 'user1' });
    expect(result.creditosRestantes).toBe(10);
  });
});
