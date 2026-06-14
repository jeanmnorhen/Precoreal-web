import { Test, TestingModule } from '@nestjs/testing';
import { GeocachingService } from './geocaching.service';
import { DatabaseService } from '../db/database.service';
import { RedisService } from '../redis/redis.service';

const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue([]),
};

const mockRedis = {
  mget: jest.fn().mockResolvedValue([]),
  pipeline: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }),
};

describe('GeocachingService', () => {
  let service: GeocachingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocachingService,
        { provide: DatabaseService, useValue: { get database() { return mockDb; } } },
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
    mockDb.limit.mockResolvedValue([
      {
        id: '1',
        titulo: 'Oferta Teste',
        lojaNome: 'Loja X',
        lojaLatitude: -23.5,
        lojaLongitude: -46.6,
        produtoNome: 'Produto Y',
        codigoBarras: '789',
        precoMedio: 1990,
      },
    ]);

    const result = await service.getNearbyAnuncios(-23.5, -46.6);

    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Oferta Teste');
    expect(result[0].distancia).toBe(999);
  });

  it('deve retornar dados do cache Redis quando disponível', async () => {
    const cachedAds = JSON.stringify([
      { id: '1', titulo: 'Cache', distancia: 1.5, lojaNome: 'Loja', lojaLatitude: -23.5, lojaLongitude: -46.6, produtoNome: 'Prod', codigoBarras: '789', precoMedio: 1500 },
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
      raioAlcanceKm: 10,
      lojaNome: 'Loja DB',
      lojaLatitude: -23.5,
      lojaLongitude: -46.6,
      produtoNome: 'Prod DB',
      codigoBarras: '789123',
      precoMedio: 2500,
      distancia: 2.345,
    };

    const chainable = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([dbRow]),
    };

    mockDb.select.mockImplementation(() => chainable);

    const result = await service.getNearbyAnuncios(-23.5, -46.6);

    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('DB Ad');
    expect(mockRedis.pipeline).toHaveBeenCalled();
  });
});
