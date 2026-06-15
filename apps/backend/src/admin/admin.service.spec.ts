import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { DatabaseService } from '../db/database.service';

const makeQuery = (result: any) => {
  const q: any = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    then: (resolve: any) => resolve(result),
  };
  return q;
};

describe('AdminService', () => {
  let service: AdminService;
  let dbSelect: jest.Mock;

  const makeService = async (resultSets: any[][]) => {
    let callIndex = 0;
    dbSelect = jest.fn(() => makeQuery(resultSets[callIndex++]));

    const mockDb = { select: dbSelect };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: DatabaseService, useValue: { get database() { return mockDb; } } },
      ],
    }).compile();
    return module.get<AdminService>(AdminService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dashboard', () => {
    it('deve retornar métricas zeradas quando não há dados', async () => {
      service = await makeService([
        [{ total: '0' }],
        [{ total: '0' }],
        [{ total: '0' }],
      ]);

      const result = await service.dashboard();

      expect(result.usuariosAtivos).toBe(0);
      expect(result.totalOfertas).toBe(0);
      expect(result.novasLojas).toBe(0);
    });

    it('deve retornar métricas com dados', async () => {
      service = await makeService([
        [{ total: '15' }],
        [{ total: '42' }],
        [{ total: '3' }],
      ]);

      const result = await service.dashboard();

      expect(result.usuariosAtivos).toBe(15);
      expect(result.totalOfertas).toBe(42);
      expect(result.novasLojas).toBe(3);
    });
  });

  describe('monitoramentoPrecos', () => {
    it('deve retornar pontos de preço sem filtros', async () => {
      service = await makeService([
        [
          { data: new Date('2026-06-01'), precoMedio: 1500, regiao: 'SP' },
          { data: new Date('2026-06-02'), precoMedio: 1600, regiao: 'SP' },
        ],
      ]);

      const result = await service.monitoramentoPrecos();

      expect(result.pontos).toHaveLength(2);
      expect(result.pontos[0].precoMedio).toBe(1500);
      expect(result.pontos[1].precoMedio).toBe(1600);
    });

    it('deve filtrar por produtoId', async () => {
      service = await makeService([[]]);
      await service.monitoramentoPrecos('prod-123');
      expect(dbSelect).toHaveBeenCalled();
    });
  });

  describe('monitoramentoUso', () => {
    it('deve retornar volume de buscas e top produtos', async () => {
      service = await makeService([
        [{ data: '2026-06-01', total: '10' }],
        [
          { produtoId: 'p1', nome: 'Arroz', totalBuscas: 100 },
          { produtoId: 'p2', nome: 'Feijão', totalBuscas: 80 },
        ],
      ]);

      const result = await service.monitoramentoUso();

      expect(result.volumeBuscas).toHaveLength(1);
      expect(result.produtosMaisBuscados).toHaveLength(2);
      expect(result.produtosMaisBuscados[0].nome).toBe('Arroz');
      expect(result.produtosMaisBuscados[0].totalBuscas).toBe(100);
    });
  });
});
