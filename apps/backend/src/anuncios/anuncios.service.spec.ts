import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';
import { ScopedAnuncioRepository } from '../db/scoped-anuncio.repository';
import { DatabaseService } from '../db/database.service';
import { LojasService } from '../lojas/lojas.service';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockDb = () => {
  const base = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
  };
  base.where.mockReturnValue(base);
  return base;
};

const mockLojasService = {
  findByProprietario: jest.fn(),
};

describe('AnunciosService', () => {
  let service: AnunciosService;
  let db: ReturnType<typeof mockDb>;

  beforeEach(async () => {
    db = mockDb();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnunciosService,
        { provide: ScopedAnuncioRepository, useValue: mockRepo },
        { provide: DatabaseService, useValue: { get database() { return db; } } },
        { provide: LojasService, useValue: mockLojasService },
      ],
    }).compile();

    service = module.get<AnunciosService>(AnunciosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar anúncio (default oferta)', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta',
      descricao: 'Desc',
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01' as string,
      dataFim: '2026-06-10' as string,
    };
    const created = { id: 'anuncio1', ...dto, tipo: 'oferta' };
    mockRepo.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(result).toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith({
      ...dto,
      tipo: 'oferta',
      dataInicio: new Date('2026-06-01'),
      dataFim: new Date('2026-06-10'),
    });
  });

  it('deve listar todos os anúncios', async () => {
    const list = [{ id: '1', titulo: 'Anúncio 1' }];
    mockRepo.findAll.mockResolvedValue(list);

    const result = await service.findAll();

    expect(result).toEqual(list);
  });

  it('deve buscar anúncio por ID', async () => {
    const anuncio = { id: '1', titulo: 'Teste' };
    mockRepo.findById.mockResolvedValue(anuncio);

    const result = await service.findById('1');

    expect(result).toEqual(anuncio);
  });

  it('deve lançar NotFoundException se anúncio não existir', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.findById('inexistente')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException ao atualizar anúncio inexistente', async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(service.update('inexistente', { titulo: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('deve deletar anúncio', async () => {
    const deleted = { id: '1' };
    mockRepo.delete.mockResolvedValue(deleted);

    const result = await service.delete('1');

    expect(result).toEqual(deleted);
  });

  it('deve lançar NotFoundException ao deletar anúncio inexistente', async () => {
    mockRepo.delete.mockResolvedValue(null);

    await expect(service.delete('inexistente')).rejects.toThrow(NotFoundException);
  });

  // ─── Regras de negócio por tipo ───

  it('deve rejeitar Oferta com validade > 15 dias', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta Longa',
      tipo: 'oferta' as const,
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-20',
    };
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/15 dias/);
  });

  it('deve rejeitar Oferta com créditos insuficientes', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta Sem Crédito',
      tipo: 'oferta' as const,
      raioAlcanceKm: 2,
      custoCreditos: 0,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/1 crédito/);
  });

  it('deve rejeitar Oferta com raio > 3km', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta Longe',
      tipo: 'oferta' as const,
      raioAlcanceKm: 10,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/3km/);
  });

  it('deve rejeitar Promoção com validade > 7 dias', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Promoção Longa',
      tipo: 'promocao' as const,
      raioAlcanceKm: 5,
      custoCreditos: 3,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/7 dias/);
  });

  it('deve rejeitar Promoção com créditos insuficientes', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Promoção Barata',
      tipo: 'promocao' as const,
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/3 crédito/);
  });

  it('deve rejeitar Promoção com raio > 5km', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Promoção Distante',
      tipo: 'promocao' as const,
      raioAlcanceKm: 10,
      custoCreditos: 3,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/5km/);
  });

  it('deve rejeitar Promoção Relâmpago com validade > 3 dias', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Relâmpago Longa',
      tipo: 'promocao_relampago' as const,
      raioAlcanceKm: 5,
      custoCreditos: 5,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/3 dias/);
  });

  it('deve rejeitar Promoção Relâmpago com créditos insuficientes', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Relâmpago Barata',
      tipo: 'promocao_relampago' as const,
      raioAlcanceKm: 5,
      custoCreditos: 2,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-02',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/5 crédito/);
  });

  it('deve rejeitar tipo inválido', async () => {
    const dto = {
      produtoId: 'prod1',
      titulo: 'Tipo Inválido',
      tipo: 'invalido' as any,
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow(/inválido/);
  });

  it('deve aceitar Oferta válida', async () => {
    mockRepo.create.mockResolvedValue({ id: 'a1', tipo: 'oferta' });

    const dto = {
      produtoId: 'prod1',
      titulo: 'Oferta OK',
      tipo: 'oferta' as const,
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
    };

    const result = await service.create(dto);
    expect(result).toBeDefined();
  });

  it('deve aceitar Promoção válida', async () => {
    mockRepo.create.mockResolvedValue({ id: 'a2', tipo: 'promocao' });

    const dto = {
      produtoId: 'prod1',
      titulo: 'Promoção OK',
      tipo: 'promocao' as const,
      raioAlcanceKm: 5,
      custoCreditos: 3,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    };

    const result = await service.create(dto);
    expect(result).toBeDefined();
  });

  it('deve aceitar Promoção Relâmpago válida', async () => {
    mockRepo.create.mockResolvedValue({ id: 'a3', tipo: 'promocao_relampago' });

    const dto = {
      produtoId: 'prod1',
      titulo: 'Relâmpago OK',
      tipo: 'promocao_relampago' as const,
      raioAlcanceKm: 8,
      custoCreditos: 5,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-02',
    };

    const result = await service.create(dto);
    expect(result).toBeDefined();
  });

  it('deve validar regras também no update', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'a1',
      tipo: 'oferta',
      dataInicio: new Date('2026-06-01'),
      dataFim: new Date('2026-06-10'),
      custoCreditos: 1,
      raioAlcanceKm: 3,
    });
    mockRepo.update.mockResolvedValue({ id: 'a1', tipo: 'oferta' });

    await expect(
      service.update('a1', { raioAlcanceKm: 5 })
    ).rejects.toThrow(BadRequestException);
  });

  // ─── Renovar ───

  describe('renovar', () => {
    const anuncioId = 'anuncio-1';
    const usuarioId = 'user-1';
    const lojaId = 'loja-1';

    const anuncioMock = {
      id: anuncioId,
      lojaId,
      tipo: 'oferta' as const,
      custoCreditos: 1,
      dataFim: new Date(Date.now() + 86400000 * 10),
    };

    const userMock = { id: usuarioId, saldoCreditos: 100 };

    it('deve renovar anúncio com sucesso', async () => {
      let whereCount = 0;
      db.where.mockImplementation(() => {
        whereCount++;
        if (whereCount === 3) return Promise.resolve(undefined); // query 4: update (terminal)
        return db;
      });

      db.limit
        .mockResolvedValueOnce([anuncioMock])   // query 1
        .mockResolvedValueOnce([userMock])       // query 3
        .mockResolvedValueOnce([{ saldoCreditos: 99 }]); // query 6

      db.returning.mockResolvedValueOnce([{ id: anuncioId, dataFim: new Date() }]); // query 5

      mockLojasService.findByProprietario.mockResolvedValue([{ id: lojaId, usuarioProprietarioId: usuarioId }]);

      const result = await service.renovar(anuncioId, usuarioId);

      expect(result.anuncio.id).toBe(anuncioId);
      expect(result.creditosRestantes).toBe(99);
    });

    it('deve lançar NotFoundException se anúncio não existe', async () => {
      db.limit.mockResolvedValueOnce([]);

      await expect(service.renovar('inexistente', usuarioId)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se anúncio não pertence a loja do usuário', async () => {
      db.limit.mockResolvedValueOnce([anuncioMock]);
      mockLojasService.findByProprietario.mockResolvedValue([]);

      await expect(service.renovar(anuncioId, usuarioId)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException se tipo de anúncio é inválido', async () => {
      db.limit.mockResolvedValueOnce([{ ...anuncioMock, tipo: 'invalido' }]);
      mockLojasService.findByProprietario.mockResolvedValue([{ id: lojaId, usuarioProprietarioId: usuarioId }]);

      await expect(service.renovar(anuncioId, usuarioId)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se saldo de créditos é insuficiente', async () => {
      db.limit
        .mockResolvedValueOnce([anuncioMock])   // query 1
        .mockResolvedValueOnce([{ id: usuarioId, saldoCreditos: 0 }]); // query 3

      mockLojasService.findByProprietario.mockResolvedValue([{ id: lojaId, usuarioProprietarioId: usuarioId }]);

      const result = service.renovar(anuncioId, usuarioId);
      await expect(result).rejects.toThrow(BadRequestException);
    });
  });
});
