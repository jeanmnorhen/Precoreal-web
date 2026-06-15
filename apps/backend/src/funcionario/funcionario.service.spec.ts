import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service';
import { DatabaseService } from '../db/database.service';

let mockQueryResult: any;

const makeDbMock = () => {
  const then = (resolve: any) => resolve(mockQueryResult !== undefined ? mockQueryResult : []);
  return {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    then,
  };
};

describe('FuncionarioService', () => {
  let service: FuncionarioService;
  let dbMock: ReturnType<typeof makeDbMock>;

  const build = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FuncionarioService,
        { provide: DatabaseService, useValue: { get database() { return dbMock; } } },
      ],
    }).compile();
    service = module.get<FuncionarioService>(FuncionarioService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarAcesso', () => {
    it('deve lançar NotFoundException quando não há vínculo', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [];
      await build();

      await expect(
        service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar acesso permitido quando tudo ok', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: new Date().getDay(), horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }];
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: true }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.acessoPermitido).toBe(true);
      expect(result.lojaNome).toBe('Loja Teste');
    });

    it('deve negar acesso quando fora do horário', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: 99, horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }];
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: true }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.horarioValido).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });

    it('deve negar acesso quando fora do perímetro', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: new Date().getDay(), horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }];
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: false }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.dentoPerimetro).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });

    it('deve tratar turno vazio como horário inválido', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{
        lojaId: 'loja-1',
        turnos: [],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }];
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: true }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.horarioValido).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });

    it('deve tratar erro no ST_DWithin como negação de perímetro', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: new Date().getDay(), horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }];
      dbMock.execute.mockRejectedValue(new Error('DB error'));
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.dentoPerimetro).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });
  });

  describe('listarLojas', () => {
    it('deve retornar lojas do funcionário', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{ id: 'loja1', nome: 'Loja Teste', enderecoCidade: 'Santos', enderecoEstado: 'SP' }];
      await build();

      const result = await service.listarLojas('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Loja Teste');
    });

    it('deve retornar lista vazia quando não há vínculos', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [];
      await build();

      const result = await service.listarLojas('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('listarProdutos', () => {
    it('deve retornar produtos da loja', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{ produtos: { id: 'p1', nome: 'Prod X' }, anuncios: { id: 'a1' } }];
      await build();

      const result = await service.listarProdutos('loja-1');

      expect(result).toHaveLength(1);
    });

    it('deve retornar lista vazia quando não há produtos', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [];
      await build();

      const result = await service.listarProdutos('loja-1');

      expect(result).toEqual([]);
    });
  });

  describe('listarAnuncios', () => {
    it('deve retornar anúncios ativos da loja', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [{ anuncios: { id: 'a1', titulo: 'Oferta' }, lojas: { nome: 'Loja X' } }];
      await build();

      const result = await service.listarAnuncios('loja-1');

      expect(result).toHaveLength(1);
    });

    it('deve retornar lista vazia quando não há anúncios', async () => {
      dbMock = makeDbMock();
      mockQueryResult = [];
      await build();

      const result = await service.listarAnuncios('loja-1');

      expect(result).toEqual([]);
    });
  });
});
