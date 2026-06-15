import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LOJA_REPOSITORY, ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository, IAnuncioRepository } from '@precoreal/domain';
import { LojasService } from './lojas.service';

const mockLojaRepository = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findByProprietario: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockAnuncioRepository = (): jest.Mocked<IAnuncioRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('LojasService', () => {
  let service: LojasService;
  let lojaRepo: jest.Mocked<ILojaRepository>;
  let anuncioRepo: jest.Mocked<IAnuncioRepository>;

  const build = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LojasService,
        { provide: LOJA_REPOSITORY, useValue: lojaRepo },
        { provide: ANUNCIO_REPOSITORY, useValue: anuncioRepo },
      ],
    }).compile();
    service = module.get<LojasService>(LojasService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPublicProfile', () => {
    const lojaMock = { id: 'loja1', nome: 'Loja Teste', criadoEm: new Date() };
    const anunciosMock = [{ id: 'a1', titulo: 'Oferta', criadoEm: new Date() }];

    it('deve retornar loja com anúncios ativos', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findById.mockResolvedValue(lojaMock as any);
      anuncioRepo.findAll.mockResolvedValue(anunciosMock as any);
      await build();

      const result = await service.findPublicProfile('loja1');

      expect(result.id).toBe('loja1');
      expect(result.nome).toBe('Loja Teste');
      expect(result.anuncios).toEqual(anunciosMock);
    });

    it('deve retornar lista vazia de anúncios quando não há anúncios ativos', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findById.mockResolvedValue(lojaMock as any);
      anuncioRepo.findAll.mockResolvedValue([]);
      await build();

      const result = await service.findPublicProfile('loja1');

      expect(result.anuncios).toEqual([]);
    });

    it('deve lançar NotFoundException se loja não existe', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findById.mockResolvedValue(null);
      await build();

      await expect(service.findPublicProfile('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('deve retornar loja quando encontrada', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findById.mockResolvedValue({ id: 'loja1', nome: 'Loja' } as any);
      await build();

      const result = await service.findById('loja1');
      expect(result.id).toBe('loja1');
    });

    it('deve lançar NotFoundException se loja não existe', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findById.mockResolvedValue(null);
      await build();

      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProprietario', () => {
    it('deve retornar lojas do proprietário', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findByProprietario.mockResolvedValue([{ id: 'loja1' }, { id: 'loja2' }] as any);
      await build();

      const result = await service.findByProprietario('user1');
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio quando proprietário não tem lojas', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.findByProprietario.mockResolvedValue([]);
      await build();

      const result = await service.findByProprietario('user1');
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('deve criar loja com dados completos', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.create.mockResolvedValue({ id: 'nova', nome: 'Minha Loja' } as any);
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
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.update.mockResolvedValue({ id: 'loja1', nome: 'Atualizada' } as any);
      await build();

      const result = await service.update('loja1', 'user1', { nome: 'Atualizada' });
      expect(result.nome).toBe('Atualizada');
    });

    it('deve lançar NotFoundException se loja não pertence ao usuário', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.update.mockResolvedValue(null);
      await build();

      await expect(service.update('x', 'user1', { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deve remover loja com sucesso', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.delete.mockResolvedValue({ id: 'loja1' } as any);
      await build();

      const result = await service.delete('loja1', 'user1');
      expect(result.id).toBe('loja1');
    });

    it('deve lançar NotFoundException se loja não pertence ao usuário', async () => {
      lojaRepo = mockLojaRepository();
      anuncioRepo = mockAnuncioRepository();
      lojaRepo.delete.mockResolvedValue(null);
      await build();

      await expect(service.delete('x', 'user1')).rejects.toThrow(NotFoundException);
    });
  });
});
