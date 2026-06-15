import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { LOJA_REPOSITORY, USUARIO_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IUsuarioRepository } from '@precoreal/domain';
import { LojistaService } from './lojista.service';
import { DatabaseService } from '../db/database.service';
import { StripeService } from '../stripe/stripe.service';

const mockDb = () => {
  const base = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  base.innerJoin.mockReturnValue(base);
  base.where.mockReturnValue(base);
  base.limit.mockResolvedValue([]);
  base.values.mockReturnThis();
  base.set.mockReturnThis();
  base.returning.mockResolvedValue([]);
  return base;
};

const mockLojaRepository = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findByProprietario: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUsuarioRepository = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  debitarCreditos: jest.fn(),
});

const mockStripeService = {
  createPaymentIntent: jest.fn().mockResolvedValue({
    clientSecret: 'pi_secret',
    id: 'pi_123',
  }),
};

describe('LojistaService', () => {
  let service: LojistaService;
  let db: ReturnType<typeof mockDb>;
  let lojaRepo: jest.Mocked<ILojaRepository>;
  let usuarioRepo: jest.Mocked<IUsuarioRepository>;

  const build = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LojistaService,
        { provide: DatabaseService, useValue: { get database() { return db; } } },
        { provide: StripeService, useValue: mockStripeService },
        { provide: LOJA_REPOSITORY, useValue: lojaRepo },
        { provide: USUARIO_REPOSITORY, useValue: usuarioRepo },
      ],
    }).compile();
    service = module.get<LojistaService>(LojistaService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dashboard', () => {
    it('deve retornar métricas zeradas quando não há lojas', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      lojaRepo.findByProprietario.mockResolvedValue([]);
      await build();

      const result = await service.dashboard('user1');

      expect(result.totalLojas).toBe(0);
      expect(result.totalAnuncios).toBe(0);
      expect(result.totalAnunciosAtivos).toBe(0);
    });

    it('deve retornar métricas do dashboard', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      lojaRepo.findByProprietario.mockResolvedValue([{ id: 'loja1' }, { id: 'loja2' }] as any);
      db.where.mockResolvedValue([{ total: '10', ativos: '5' }]);
      await build();

      const result = await service.dashboard('user1');

      expect(result.totalLojas).toBe(2);
    });
  });

  describe('comprarCreditos', () => {
    it('deve delegar ao StripeService.createPaymentIntent', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      await build();
      const result = await service.comprarCreditos('user1', 'a@b.com', 1000);

      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(1000, 'a@b.com', 'user1');
      expect(result.clientSecret).toBe('pi_secret');
    });
  });

  // ─── Funcionários CRUD ───

  describe('listarFuncionarios', () => {
    it('deve retornar lista de funcionários com turnos parseados', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      db.where.mockResolvedValue([
        {
          id: 'v1', usuarioId: 'u1', nome: 'Carlos', email: 'carlos@email.com',
          lojaId: 'loja1', turnos: ['{"diaSemana":1,"horaInicio":"08:00","horaFim":"18:00"}'],
          criadoEm: new Date('2026-01-01'),
        },
      ]);
      await build();

      const result = await service.listarFuncionarios('loja1');
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Carlos');
      expect(result[0].turnos).toHaveLength(1);
      expect(result[0].turnos[0].diaSemana).toBe(1);
    });

    it('deve retornar lista vazia quando não há funcionários', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      db.where.mockResolvedValue([]);
      await build();

      const result = await service.listarFuncionarios('loja1');
      expect(result).toEqual([]);
    });
  });

  describe('adicionarFuncionario', () => {
    it('deve adicionar funcionário com sucesso', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      lojaRepo.findById.mockResolvedValue({ id: 'loja1', usuarioProprietarioId: 'owner1' } as any);
      usuarioRepo.findByEmail.mockResolvedValue({ id: 'u1', nome: 'Carlos', email: 'carlos@email.com' } as any);
      db.limit.mockResolvedValueOnce([]);
      db.returning.mockResolvedValue([{ id: 'v1', usuarioId: 'u1', lojaId: 'loja1', criadoEm: new Date() }]);
      await build();

      const result = await service.adicionarFuncionario(
        'owner1', 'carlos@email.com', 'loja1',
        [{ diaSemana: 1, horaInicio: '08:00', horaFim: '18:00' }],
      );

      expect(result.email).toBe('carlos@email.com');
    });

    it('deve lançar NotFoundException se loja não pertence ao proprietário', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      lojaRepo.findById.mockResolvedValue(null);
      await build();

      await expect(
        service.adicionarFuncionario('owner1', 'c@email.com', 'loja1', []),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se email não existe', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      lojaRepo.findById.mockResolvedValue({ id: 'loja1', usuarioProprietarioId: 'owner1' } as any);
      usuarioRepo.findByEmail.mockResolvedValue(null);
      await build();

      await expect(
        service.adicionarFuncionario('owner1', 'inexistente@email.com', 'loja1', []),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se vínculo já existe', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      lojaRepo.findById.mockResolvedValue({ id: 'loja1', usuarioProprietarioId: 'owner1' } as any);
      usuarioRepo.findByEmail.mockResolvedValue({ id: 'u1', nome: 'Carlos', email: 'carlos@email.com' } as any);
      db.limit.mockResolvedValueOnce([{ id: 'v1' }]);
      await build();

      await expect(
        service.adicionarFuncionario('owner1', 'carlos@email.com', 'loja1', []),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('atualizarTurnos', () => {
    it('deve atualizar turnos com sucesso', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      db.returning.mockResolvedValue([{ id: 'v1' }]);
      await build();

      const result = await service.atualizarTurnos('v1', [
        { diaSemana: 1, horaInicio: '09:00', horaFim: '17:00' },
      ]);

      expect(result.turnos).toHaveLength(1);
    });

    it('deve lançar NotFoundException se vínculo não existe', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      db.returning.mockResolvedValue([]);
      await build();

      await expect(
        service.atualizarTurnos('v1', []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removerFuncionario', () => {
    it('deve remover funcionário com sucesso', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      db.returning.mockResolvedValue([{ id: 'v1' }]);
      await build();

      const result = await service.removerFuncionario('v1');
      expect(result.removido).toBe(true);
    });

    it('deve lançar NotFoundException se vínculo não existe', async () => {
      db = mockDb();
      lojaRepo = mockLojaRepository();
      usuarioRepo = mockUsuarioRepository();
      db.returning.mockResolvedValue([]);
      await build();

      await expect(
        service.removerFuncionario('v1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
