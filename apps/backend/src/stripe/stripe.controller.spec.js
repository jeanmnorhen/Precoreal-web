"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const stripe_controller_1 = require("./stripe.controller");
const stripe_service_1 = require("./stripe.service");
const database_service_1 = require("../db/database.service");
const mockDb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(undefined),
};
describe('StripeController', () => {
    let controller;
    beforeEach(async () => {
        process.env.STRIPE_RESTRICTED_KEY = 'sk_test_mock';
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
        const module = await testing_1.Test.createTestingModule({
            controllers: [stripe_controller_1.StripeController],
            providers: [
                stripe_service_1.StripeService,
                { provide: database_service_1.DatabaseService, useValue: { get database() { return mockDb; } } },
            ],
        }).compile();
        controller = module.get(stripe_controller_1.StripeController);
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
