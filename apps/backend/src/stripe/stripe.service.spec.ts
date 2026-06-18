import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { USUARIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';

const mockUsuarioRepository = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  debitarCreditos: jest.fn(),
  creditarCreditos: jest.fn(),
  countByDateRange: jest.fn(),
  getRegistrationsByDay: jest.fn(),
});

function createMockStripe(reject = false) {
  return {
    paymentIntents: {
      create: reject
        ? jest.fn().mockRejectedValue(new Error('stripe error'))
        : jest.fn().mockResolvedValue({
            client_secret: 'pi_secret_123',
            id: 'pi_123',
          }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { metadata: { usuarioId: 'user1', creditosAAdicionar: '10' } } },
      }),
    },
  };
}

describe('StripeService', () => {
  let service: StripeService;
  let usuarioRepo: jest.Mocked<IUsuarioRepository>;

  beforeEach(async () => {
    process.env.STRIPE_RESTRICTED_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
    usuarioRepo = mockUsuarioRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: USUARIO_REPOSITORY, useValue: usuarioRepo },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    (service as any).stripe = createMockStripe();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_RESTRICTED_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('deve lançar erro se STRIPE_RESTRICTED_KEY não estiver configurada', () => {
    delete process.env.STRIPE_RESTRICTED_KEY;
    const emptyRepo = mockUsuarioRepository();
    expect(() => new StripeService(emptyRepo).onModuleInit()).toThrow();
  });

  describe('createPaymentIntent', () => {
    it('deve retornar clientSecret e id', async () => {
      const result = await service.createPaymentIntent(1000, 'a@b.com', 'user1');

      expect(result).toEqual({ clientSecret: 'pi_secret_123', id: 'pi_123' });
    });

    it('deve abrir circuit breaker após 3 falhas consecutivas', async () => {
      (service as any).stripe = createMockStripe(true);

      for (let i = 0; i < 3; i++) {
        await expect(
          service.createPaymentIntent(1000, 'a@b.com', 'user1'),
        ).rejects.toThrow('stripe error');
      }

      await expect(
        service.createPaymentIntent(1000, 'a@b.com', 'user1'),
      ).rejects.toThrow('Serviço de pagamento temporariamente indisponível');

      (service as any).circuitOpen = false;
      (service as any).consecutiveFailures = 0;
    });
  });

  describe('handleWebhook', () => {
    it('deve lançar erro se STRIPE_WEBHOOK_SECRET não configurado', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      await expect(
        service.handleWebhook('sig', Buffer.from('{}')),
      ).rejects.toThrow('STRIPE_WEBHOOK_SECRET não configurado');
    });

    it('deve processar webhook com sucesso', async () => {
      const result = await service.handleWebhook('sig', Buffer.from('{}'));

      expect(result).toEqual({ received: true });
    });
  });
});
