import { Test, TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
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

describe('StripeController', () => {
  let controller: StripeController;

  beforeEach(async () => {
    process.env.STRIPE_RESTRICTED_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
        StripeService,
        { provide: USUARIO_REPOSITORY, useValue: mockUsuarioRepository() },
      ],
    }).compile();

    controller = module.get<StripeController>(StripeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_RESTRICTED_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
