import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service';
import { DatabaseService } from '../db/database.service';

const makeDbMock = () => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue([]),
  execute: jest.fn(),
});

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
      dbMock.limit.mockResolvedValue([]);
      await build();

      await expect(
        service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar acesso permitido quando tudo ok', async () => {
      dbMock = makeDbMock();
      dbMock.limit.mockResolvedValue([{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: new Date().getDay(), horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }]);
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: true }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.acessoPermitido).toBe(true);
      expect(result.lojaNome).toBe('Loja Teste');
      expect(result.acessoPermitido).toBe(true);
    });

    it('deve negar acesso quando fora do horário', async () => {
      dbMock = makeDbMock();
      dbMock.limit.mockResolvedValue([{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: 99, horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }]);
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: true }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.horarioValido).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });

    it('deve negar acesso quando fora do perímetro', async () => {
      dbMock = makeDbMock();
      dbMock.limit.mockResolvedValue([{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: new Date().getDay(), horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }]);
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: false }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.dentoPerimetro).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });

    it('deve tratar turno vazio como horário inválido', async () => {
      dbMock = makeDbMock();
      dbMock.limit.mockResolvedValue([{
        lojaId: 'loja-1',
        turnos: [],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }]);
      dbMock.execute.mockResolvedValue({ rows: [{ dentro: true }] });
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.horarioValido).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });

    it('deve tratar erro no ST_DWithin como negação de perímetro', async () => {
      dbMock = makeDbMock();
      dbMock.limit.mockResolvedValue([{
        lojaId: 'loja-1',
        turnos: [JSON.stringify({ diaSemana: new Date().getDay(), horaInicio: '00:00', horaFim: '23:59' })],
        lojaNome: 'Loja Teste',
        lojaPerimetro: null,
        lojaRaio: 300,
        lojaLocalizacao: 'SRID=4326;POINT(-46.34 -23.94)',
      }]);
      dbMock.execute.mockRejectedValue(new Error('DB error'));
      await build();

      const result = await service.verificarAcesso('user-1', 'loja-1', -23.94, -46.34);

      expect(result.dentoPerimetro).toBe(false);
      expect(result.acessoPermitido).toBe(false);
    });
  });
});
