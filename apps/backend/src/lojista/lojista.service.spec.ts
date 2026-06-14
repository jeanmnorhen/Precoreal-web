import { Test, TestingModule } from '@nestjs/testing';
import { LojistaService } from './lojista.service';
import { DatabaseService } from '../db/database.service';
import { StripeService } from '../stripe/stripe.service';

const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
};

const mockStripeService = {
  createPaymentIntent: jest.fn().mockResolvedValue({
    clientSecret: 'pi_secret',
    id: 'pi_123',
  }),
};

describe('LojistaService', () => {
  let service: LojistaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LojistaService,
        { provide: DatabaseService, useValue: { get database() { return mockDb; } } },
        { provide: StripeService, useValue: mockStripeService },
      ],
    }).compile();

    service = module.get<LojistaService>(LojistaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dashboard', () => {
    it('deve retornar métricas zeradas quando não há lojas', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await service.dashboard('user1');

      expect(result.totalLojas).toBe(0);
      expect(result.totalAnuncios).toBe(0);
      expect(result.totalAnunciosAtivos).toBe(0);
    });

    it('deve retornar métricas do dashboard', async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 'loja1' }, { id: 'loja2' }])
        .mockResolvedValueOnce([{ total: '10', ativos: '5' }]);

      const result = await service.dashboard('user1');

      expect(result.totalLojas).toBe(2);
    });
  });

  describe('comprarCreditos', () => {
    it('deve delegar ao StripeService.createPaymentIntent', async () => {
      const result = await service.comprarCreditos('user1', 'a@b.com', 1000);

      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(1000, 'a@b.com', 'user1');
      expect(result.clientSecret).toBe('pi_secret');
    });
  });
});
