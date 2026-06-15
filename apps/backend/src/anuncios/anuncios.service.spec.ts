import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';
import { LojasService } from '../lojas/lojas.service';
import { ANUNCIO_REPOSITORY, USUARIO_REPOSITORY } from '@precoreal/domain';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUsuarioRepo = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  debitarCreditos: jest.fn(),
};

const mockLojasService = {
  findByProprietario: jest.fn(),
};

describe('AnunciosService', () => {
  let service: AnunciosService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnunciosService,
        { provide: ANUNCIO_REPOSITORY, useValue: mockRepo },
        { provide: USUARIO_REPOSITORY, useValue: mockUsuarioRepo },
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
    const created = { id: 'anuncio1' };
    mockRepo.create.mockResolvedValue(created as any);

    const result = await service.create(dto);

    expect(result).toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith({
      lojaId: '',
      status: 'ativo' as const,
      produtoId: dto.produtoId,
      titulo: dto.titulo,
      descricao: dto.descricao || null,
      tipo: 'oferta' as const,
      raioAlcanceKm: dto.raioAlcanceKm,
      custoCreditos: dto.custoCreditos,
      dataInicio: new Date(dto.dataInicio),
      dataFim: new Date(dto.dataFim),
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
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 86400000 * 10),
    };

    it('deve renovar anúncio com sucesso', async () => {
      mockRepo.findById.mockResolvedValue(anuncioMock);
      mockLojasService.findByProprietario.mockResolvedValue([{ id: lojaId, usuarioProprietarioId: usuarioId }]);
      mockUsuarioRepo.findById.mockResolvedValue({ id: usuarioId, saldoCreditos: 100 });
      mockUsuarioRepo.debitarCreditos.mockResolvedValue(99);
      mockRepo.update.mockResolvedValue({ id: anuncioId, dataFim: new Date() });

      const result = await service.renovar(anuncioId, usuarioId);

      expect(result.anuncio.id).toBe(anuncioId);
      expect(result.creditosRestantes).toBe(99);
      expect(mockUsuarioRepo.debitarCreditos).toHaveBeenCalledWith(usuarioId, 1);
    });

    it('deve lançar NotFoundException se anúncio não existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.renovar('inexistente', usuarioId)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se anúncio não pertence a loja do usuário', async () => {
      mockRepo.findById.mockResolvedValue(anuncioMock);
      mockLojasService.findByProprietario.mockResolvedValue([]);

      await expect(service.renovar(anuncioId, usuarioId)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException se tipo de anúncio é inválido', async () => {
      mockRepo.findById.mockResolvedValue({ ...anuncioMock, tipo: 'invalido' });
      mockLojasService.findByProprietario.mockResolvedValue([{ id: lojaId, usuarioProprietarioId: usuarioId }]);

      await expect(service.renovar(anuncioId, usuarioId)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se saldo de créditos é insuficiente', async () => {
      mockRepo.findById.mockResolvedValue(anuncioMock);
      mockLojasService.findByProprietario.mockResolvedValue([{ id: lojaId, usuarioProprietarioId: usuarioId }]);
      mockUsuarioRepo.findById.mockResolvedValue({ id: usuarioId, saldoCreditos: 0 });

      await expect(service.renovar(anuncioId, usuarioId)).rejects.toThrow(BadRequestException);
    });
  });
});
