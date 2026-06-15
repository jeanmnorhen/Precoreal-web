import { Test, TestingModule } from '@nestjs/testing';
import { Module } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
import { DatabaseService } from '../src/db/database.service';
import { RedisService } from '../src/redis/redis.service';
import { QueuesService } from '../src/queues/queues.service';
import { QueuesModule } from '../src/queues/queues.module';

const mockDb = () => {
  const base = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };
  base.where.mockReturnValue(base);
  base.innerJoin.mockReturnValue(base);
  base.orderBy.mockReturnValue(base);
  base.groupBy.mockReturnValue(base);
  base.limit.mockResolvedValue([]);
  base.values.mockReturnThis();
  base.set.mockReturnThis();
  base.returning.mockResolvedValue([]);
  return base;
};

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  mget: jest.fn().mockResolvedValue([]),
  pipeline: jest.fn().mockReturnValue({ set: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }),
};

let dbInstance: ReturnType<typeof mockDb>;

const mockDbProvider = {
  get database() { return dbInstance; },
};

@Module({
  providers: [
    {
      provide: QueuesService,
      useValue: { adicionarNotificacao: jest.fn(), registrarImpressao: jest.fn() },
    },
  ],
  exports: [QueuesService],
})
class MockQueuesModule {}

describe('App (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    dbInstance = mockDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDbProvider)
      .overrideProvider(RedisService)
      .useValue({ get redis() { return mockRedisClient; } })
      .overrideModule(QueuesModule).useModule(MockQueuesModule)
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
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

  describe('Auth', () => {
    it('POST /auth/register -> 409 se email já existe', async () => {
      dbInstance.limit.mockResolvedValue([{ id: '1', email: 'joao@email.com' }]);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' })
        .expect(409);

      expect(res.body.message).toBe('Email já cadastrado.');
    });

    it('POST /auth/login -> 401 se usuário não existe', async () => {
      dbInstance.limit.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'x@x.com', senha: '123456' })
        .expect(401);

      expect(res.body.message).toBe('Email ou senha inválidos.');
    });

    it('POST /auth/register -> deve aceitar tipo admin e funcionario', async () => {
      dbInstance.limit.mockResolvedValue([]);
      dbInstance.returning.mockResolvedValue([{ id: 'u1', nome: 'Admin', email: 'admin@test.com', tipo: 'admin' }]);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ nome: 'Admin', email: 'admin@test.com', senha: '123456', tipo: 'admin' })
        .expect(201);

      expect(res.body.user.tipo).toBe('admin');
      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe('Admin', () => {
    it('GET /admin/dashboard -> 403 sem token', async () => {
      await request(app.getHttpServer())
        .get('/admin/dashboard')
        .expect(401);
    });

    it('GET /admin/precos -> 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/admin/precos')
        .expect(401);
    });

    it('GET /admin/uso -> 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/admin/uso')
        .expect(401);
    });
  });

  describe('Funcionario', () => {
    it('GET /funcionario/lojas -> 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/funcionario/lojas')
        .expect(401);
    });

    it('POST /funcionario/verificar-acesso/:lojaId -> 401 sem token', async () => {
      await request(app.getHttpServer())
        .post('/funcionario/verificar-acesso/loja-1')
        .send({ latitude: -23.94, longitude: -46.34 })
        .expect(401);
    });
  });

  describe('Lojista Funcionarios', () => {
    it('GET /lojista/funcionarios?lojaId=x -> 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/lojista/funcionarios?lojaId=loja-1')
        .expect(401);
    });

    it('POST /lojista/funcionarios -> 401 sem token', async () => {
      await request(app.getHttpServer())
        .post('/lojista/funcionarios')
        .send({ email: 'func@test.com', lojaId: 'loja-1', turnos: [] })
        .expect(401);
    });
  });

  describe('Lojas (público)', () => {
    it('GET /lojas/public/:id -> 200 com dados da loja', async () => {
      dbInstance = mockDb();
      dbInstance.limit.mockResolvedValueOnce([{ id: 'loja1', nome: 'Loja Teste', logoUrl: null }]);
      dbInstance.orderBy.mockResolvedValueOnce([{ id: 'a1', titulo: 'Oferta', status: 'ativo' }]);

      const res = await request(app.getHttpServer())
        .get('/lojas/public/loja1')
        .expect(200);

      expect(res.body.id).toBe('loja1');
      expect(res.body.anuncios).toHaveLength(1);
    });

    it('GET /lojas/public/:id -> 404 se loja não existe', async () => {
      dbInstance = mockDb();
      dbInstance.limit.mockResolvedValueOnce([]);

      await request(app.getHttpServer())
        .get('/lojas/public/inexistente')
        .expect(404);
    });
  });

  describe('Anuncios', () => {
    it('GET /anuncios/proximos -> array vazio', async () => {
      const res = await request(app.getHttpServer())
        .get('/anuncios/proximos?latitude=-23.5&longitude=-46.6')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /anuncios/proximos?tipo=oferta -> array vazio', async () => {
      const res = await request(app.getHttpServer())
        .get('/anuncios/proximos?latitude=-23.5&longitude=-46.6&tipo=oferta')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /anuncios/proximos?tipo=invalido -> 400', async () => {
      await request(app.getHttpServer())
        .get('/anuncios/proximos?latitude=-23.5&longitude=-46.6&tipo=invalido')
        .expect(400);
    });
  });

  describe('Anuncios Renovar', () => {
    it('POST /anuncios/:id/renovar -> 401 sem token', async () => {
      dbInstance = mockDb();
      await request(app.getHttpServer())
        .post('/anuncios/anuncio-1/renovar')
        .expect(401);
    });

    it('POST /anuncios/:id/renovar -> 200 e retorna creditosRestantes', async () => {
      dbInstance = mockDb();
      dbInstance.limit.mockResolvedValue([]);
      dbInstance.returning.mockResolvedValue([{ id: 'u1', nome: 'Lojista', email: 'lojista@test.com', tipo: 'lojista' }]);

      const regRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ nome: 'Lojista', email: 'lojista@test.com', senha: '123456', tipo: 'lojista' })
        .expect(201);

      const token = regRes.body.accessToken;

      const anuncioId = 'anuncio-1';
      const lojaId = 'loja-do-user';
      dbInstance = mockDb();
      dbInstance.limit
        .mockResolvedValueOnce([{ id: anuncioId, lojaId, tipo: 'oferta', custoCreditos: 1, dataFim: new Date(Date.now() + 86400000 * 10) }])
        .mockResolvedValueOnce([{ id: 'u1', saldoCreditos: 100 }])
        .mockResolvedValueOnce([{ saldoCreditos: 99 }]);

      let whereCount = 0;
      dbInstance.where.mockImplementation(() => {
        whereCount++;
        if (whereCount === 2) return Promise.resolve([{ id: lojaId, usuarioProprietarioId: 'u1' }]); // findByProprietario
        if (whereCount === 4) return Promise.resolve(undefined); // update user credits
        return dbInstance;
      });

      dbInstance.returning.mockResolvedValueOnce([{ id: anuncioId, dataFim: new Date() }]);

      const res = await request(app.getHttpServer())
        .post(`/anuncios/${anuncioId}/renovar`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body.creditosRestantes).toBeDefined();
      expect(res.body.anuncio).toBeDefined();
    });
  });
});
