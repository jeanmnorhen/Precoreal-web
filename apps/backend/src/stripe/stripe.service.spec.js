"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const stripe_service_1 = require("./stripe.service");
const database_service_1 = require("../db/database.service");
const mockDb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(undefined),
};
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
                data: { object: { metadata: { usuarioId: 'user1', creditosAAdicionar: '1000' } } },
            }),
        },
    };
}
describe('StripeService', () => {
    let service;
    beforeEach(async () => {
        process.env.STRIPE_RESTRICTED_KEY = 'sk_test_mock';
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
        const module = await testing_1.Test.createTestingModule({
            providers: [
                stripe_service_1.StripeService,
                { provide: database_service_1.DatabaseService, useValue: { get database() { return mockDb; } } },
            ],
        }).compile();
        service = module.get(stripe_service_1.StripeService);
        service.stripe = createMockStripe();
    });
    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.STRIPE_RESTRICTED_KEY;
        delete process.env.STRIPE_WEBHOOK_SECRET;
    });
    it('deve lançar erro se STRIPE_RESTRICTED_KEY não estiver configurada', () => {
        delete process.env.STRIPE_RESTRICTED_KEY;
        expect(() => new stripe_service_1.StripeService({}).onModuleInit()).toThrow();
    });
    describe('createPaymentIntent', () => {
        it('deve retornar clientSecret e id', async () => {
            const result = await service.createPaymentIntent(1000, 'a@b.com', 'user1');
            expect(result).toEqual({ clientSecret: 'pi_secret_123', id: 'pi_123' });
        });
        it('deve abrir circuit breaker após 3 falhas consecutivas', async () => {
            service.stripe = createMockStripe(true);
            for (let i = 0; i < 3; i++) {
                await expect(service.createPaymentIntent(1000, 'a@b.com', 'user1')).rejects.toThrow('stripe error');
            }
            await expect(service.createPaymentIntent(1000, 'a@b.com', 'user1')).rejects.toThrow('Serviço de pagamento temporariamente indisponível');
            service.circuitOpen = false;
            service.consecutiveFailures = 0;
        });
    });
    describe('handleWebhook', () => {
        it('deve lançar erro se STRIPE_WEBHOOK_SECRET não configurado', async () => {
            delete process.env.STRIPE_WEBHOOK_SECRET;
            await expect(service.handleWebhook('sig', Buffer.from('{}'))).rejects.toThrow('STRIPE_WEBHOOK_SECRET não configurado');
        });
        it('deve processar webhook com sucesso', async () => {
            const result = await service.handleWebhook('sig', Buffer.from('{}'));
            expect(result).toEqual({ received: true });
        });
    });
});
