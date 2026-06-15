import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LojasService } from './lojas.service';
import { DatabaseService } from '../db/database.service';

const mockDb = () => {
  const base = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    orderBy: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  base.where.mockReturnValue(base);
  return base;
};

describe('LojasService', () => {
  let service: LojasService;
  let db: ReturnType<typeof mockDb>;

  const build = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LojasService,
        { provide: DatabaseService, useValue: { get database() { return db; } } },
      ],
    }).compile();
    service = module.get<LojasService>(LojasService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPublicProfile', () => {
    const lojaMock = { id: 'loja1', nome: 'Loja Teste' };
    const anunciosMock = [{ id: 'a1', titulo: 'Oferta' }];

    it('deve retornar loja com anúncios ativos', async () => {
      db = mockDb();
      db.limit.mockResolvedValueOnce([lojaMock]);
      db.orderBy.mockResolvedValueOnce(anunciosMock);
      await build();

      const result = await service.findPublicProfile('loja1');

      expect(result.id).toBe('loja1');
      expect(result.nome).toBe('Loja Teste');
      expect(result.anuncios).toEqual(anunciosMock);
    });

    it('deve retornar lista vazia de anúncios quando não há anúncios ativos', async () => {
      db = mockDb();
      db.limit.mockResolvedValueOnce([lojaMock]);
      db.orderBy.mockResolvedValueOnce([]);
      await build();

      const result = await service.findPublicProfile('loja1');

      expect(result.anuncios).toEqual([]);
    });

    it('deve lançar NotFoundException se loja não existe', async () => {
      db = mockDb();
      db.limit.mockResolvedValueOnce([]);
      await build();

      await expect(service.findPublicProfile('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('deve retornar loja quando encontrada', async () => {
      db = mockDb();
      db.limit.mockResolvedValueOnce([{ id: 'loja1', nome: 'Loja' }]);
      await build();

      const result = await service.findById('loja1');
      expect(result.id).toBe('loja1');
    });

    it('deve lançar NotFoundException se loja não existe', async () => {
      db = mockDb();
      db.limit.mockResolvedValueOnce([]);
      await build();

      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProprietario', () => {
    it('deve retornar lojas do proprietário', async () => {
      db = mockDb();
      db.where.mockResolvedValue([{ id: 'loja1' }, { id: 'loja2' }]);
      await build();

      const result = await service.findByProprietario('user1');
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio quando proprietário não tem lojas', async () => {
      db = mockDb();
      db.where.mockResolvedValue([]);
      await build();

      const result = await service.findByProprietario('user1');
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('deve criar loja com dados completos', async () => {
      db = mockDb();
      const lojaEsperada = { id: 'nova', nome: 'Minha Loja' };
      db.returning.mockResolvedValue([lojaEsperada]);
      await build();

      const result = await service.create('user1', {
        nome: 'Minha Loja',
        enderecoRua: 'Rua A',
        enderecoNumero: '100',
        enderecoBairro: 'Centro',
        enderecoCidade: 'SP',
        enderecoEstado: 'SP',
        enderecoCep: '01001000',
        latitude: '-23.5',
        longitude: '-46.6',
      });

      expect(result.id).toBe('nova');
    });
  });

  describe('update', () => {
    it('deve atualizar loja com sucesso', async () => {
      db = mockDb();
      db.returning.mockResolvedValue([{ id: 'loja1', nome: 'Atualizada' }]);
      await build();

      const result = await service.update('loja1', 'user1', { nome: 'Atualizada' });
      expect(result.nome).toBe('Atualizada');
    });

    it('deve lançar NotFoundException se loja não pertence ao usuário', async () => {
      db = mockDb();
      db.returning.mockResolvedValue([]);
      await build();

      await expect(service.update('x', 'user1', { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deve remover loja com sucesso', async () => {
      db = mockDb();
      db.returning.mockResolvedValue([{ id: 'loja1' }]);
      await build();

      const result = await service.delete('loja1', 'user1');
      expect(result.id).toBe('loja1');
    });

    it('deve lançar NotFoundException se loja não pertence ao usuário', async () => {
      db = mockDb();
      db.returning.mockResolvedValue([]);
      await build();

      await expect(service.delete('x', 'user1')).rejects.toThrow(NotFoundException);
    });
  });
});
