import { Test, TestingModule } from '@nestjs/testing';
import { ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository } from '@precoreal/domain';
import { GeocachingService } from './geocaching.service';
import { RedisService } from '../redis/redis.service';

const mockRedis = {
  mget: jest.fn().mockResolvedValue([]),
  pipeline: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }),
};

const mockAnuncioRepo = (): jest.Mocked<IAnuncioRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  countByLojaIds: jest.fn(),
  countAll: jest.fn(),
  findProximos: jest.fn(),
  findAtivosComDetalhes: jest.fn(),
  getTopProdutos: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('GeocachingService', () => {
  let service: GeocachingService;
  let anuncioRepo: jest.Mocked<IAnuncioRepository>;

  beforeEach(async () => {
    anuncioRepo = mockAnuncioRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocachingService,
        { provide: ANUNCIO_REPOSITORY, useValue: anuncioRepo },
        { provide: RedisService, useValue: { get redis() { return mockRedis; } } },
      ],
    }).compile();

    service = module.get<GeocachingService>(GeocachingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar fallback quando Redis falha', async () => {
    mockRedis.mget.mockRejectedValue(new Error('Redis down'));
    anuncioRepo.findProximos.mockResolvedValue([
      {
        id: '1',
        titulo: 'Oferta Teste',
        tipo: 'produto',
        lojaNome: 'Loja X',
        lojaLatitude: -23.5,
        lojaLongitude: -46.6,
        produtoNome: 'Produto Y',
        codigoBarras: '789',
        precoMedio: 1990,
        distancia: 999,
      },
    ]);

    const result = await service.getNearbyAnuncios(-23.5, -46.6);

    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Oferta Teste');
    expect(result[0].distancia).toBe(999);
  });

  it('deve retornar dados do cache Redis quando disponível', async () => {
    const cachedAds = JSON.stringify([
      { id: '1', titulo: 'Cache', tipo: 'produto', distancia: 1.5, lojaNome: 'Loja', lojaLatitude: -23.5, lojaLongitude: -46.6, produtoNome: 'Prod', codigoBarras: '789', precoMedio: 1500 },
    ]);
    mockRedis.mget.mockResolvedValue([cachedAds]);

    const result = await service.getNearbyAnuncios(-23.5, -46.6);

    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Cache');
  });

  it('deve consultar DB e popular cache em caso de cache miss', async () => {
    mockRedis.mget.mockResolvedValue([null]);

    const dbRow = {
      id: '1',
      titulo: 'DB Ad',
      tipo: 'produto',
      lojaNome: 'Loja DB',
      lojaLatitude: -23.5,
      lojaLongitude: -46.6,
      produtoNome: 'Prod DB',
      codigoBarras: '789123',
      precoMedio: 2500,
      distancia: 2.345,
    };

    anuncioRepo.findProximos.mockResolvedValue([dbRow]);

    const result = await service.getNearbyAnuncios(-23.5, -46.6);

    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('DB Ad');
    expect(mockRedis.pipeline).toHaveBeenCalled();
  });
});
