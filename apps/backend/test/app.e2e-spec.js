"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("../src/app.module");
// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
const database_service_1 = require("../src/db/database.service");
const redis_service_1 = require("../src/redis/redis.service");
const queues_service_1 = require("../src/queues/queues.service");
const queues_module_1 = require("../src/queues/queues.module");
const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
};
const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    mget: jest.fn().mockResolvedValue([]),
    pipeline: jest.fn().mockReturnValue({ set: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }),
};
let MockQueuesModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            providers: [
                {
                    provide: queues_service_1.QueuesService,
                    useValue: { adicionarNotificacao: jest.fn(), registrarImpressao: jest.fn() },
                },
            ],
            exports: [queues_service_1.QueuesService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MockQueuesModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MockQueuesModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return MockQueuesModule = _classThis;
})();
describe('App (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider(database_service_1.DatabaseService)
            .useValue({ get database() { return mockDb; } })
            .overrideProvider(redis_service_1.RedisService)
            .useValue({ get redis() { return mockRedisClient; } })
            .overrideModule(queues_module_1.QueuesModule).useModule(MockQueuesModule)
            .compile();
        app = moduleFixture.createNestApplication(new platform_fastify_1.FastifyAdapter());
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });
    afterEach(async () => {
        await app.close();
        jest.clearAllMocks();
    });
    it('GET / -> deve retornar Hello World!', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!');
    });
    it('POST /auth/register -> deve retornar 409 se mock retorna usuário existente', async () => {
        mockDb.limit.mockResolvedValue([{ id: '1', email: 'joao@email.com' }]);
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' })
            .expect(409);
        expect(res.body.message).toBe('Email já cadastrado.');
    });
    it('POST /auth/login -> deve retornar 401 se usuário não existe', async () => {
        mockDb.limit.mockResolvedValue([]);
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'x@x.com', senha: '123456' })
            .expect(401);
        expect(res.body.message).toBe('Email ou senha inválidos.');
    });
    it('GET /anuncios/proximos -> deve retornar array vazio', async () => {
        const res = await request(app.getHttpServer())
            .get('/anuncios/proximos?latitude=-23.5&longitude=-46.6')
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
