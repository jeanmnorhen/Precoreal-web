import { Test, TestingModule } from '@nestjs/testing';
import { AnunciosController } from './anuncios.controller';
import { AnunciosService } from './anuncios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('AnunciosController', () => {
  let controller: AnunciosController;
  let service: AnunciosService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    renovar: jest.fn(),
  };

  const user = { userId: 'user1', email: 'a@b.com', tipo: 'lojista' as const };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnunciosController],
      providers: [{ provide: AnunciosService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .compile();

    controller = module.get<AnunciosController>(AnunciosController);
    service = module.get<AnunciosService>(AnunciosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create() deve chamar service.create com dto', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta',
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
    };
    mockService.create.mockResolvedValue({ id: 'a1' });

    const result = await controller.create(dto);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe('a1');
  });

  it('findAll() deve chamar service.findAll', async () => {
    mockService.findAll.mockResolvedValue([{ id: 'a1' }]);

    const result = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('findOne() deve chamar service.findById', async () => {
    mockService.findById.mockResolvedValue({ id: 'a1' });

    const result = await controller.findOne('a1');

    expect(mockService.findById).toHaveBeenCalledWith('a1');
    expect(result.id).toBe('a1');
  });

  it('update() deve chamar service.update com id e dto', async () => {
    const dto = { titulo: 'Novo' };
    mockService.update.mockResolvedValue({ id: 'a1', titulo: 'Novo' });

    const result = await controller.update('a1', dto);

    expect(mockService.update).toHaveBeenCalledWith('a1', dto);
    expect(result.titulo).toBe('Novo');
  });

  it('remove() deve chamar service.delete', async () => {
    mockService.delete.mockResolvedValue({ id: 'a1' });

    const result = await controller.remove('a1');

    expect(mockService.delete).toHaveBeenCalledWith('a1');
    expect(result.id).toBe('a1');
  });

  it('renovar() deve chamar service.renovar com id e userId', async () => {
    mockService.renovar.mockResolvedValue({ anuncio: { id: 'a1' }, creditosRestantes: 10 });

    const result = await controller.renovar('a1', user);

    expect(mockService.renovar).toHaveBeenCalledWith('a1', 'user1');
    expect(result.creditosRestantes).toBe(10);
  });
});
