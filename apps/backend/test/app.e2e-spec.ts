import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/db/database.service';
import { RedisService } from '../src/redis/redis.service';
import { QueuesService } from '../src/queues/queues.service';
import { QueuesModule } from '../src/queues/queues.module';

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
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({ get database() { return mockDb; } })
      .overrideProvider(RedisService)
      .useValue({ get redis() { return mockRedisClient; } })
      .overrideModule(QueuesModule).useModule(MockQueuesModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
