import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { DatabaseService } from '../db/database.service';

const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue([]),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockResolvedValue([]),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: { get database() { return mockDb; } } },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar um novo usuário e retornar token', async () => {
      const dto = { nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' as const };
      const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', senhaHash: 'hash' };

      mockDb.limit.mockResolvedValue([]);
      mockDb.returning.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as never);

      const result = await service.register(dto);

      expect(result.user.email).toBe('joao@email.com');
      expect(result.accessToken).toBe('token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({ userId: '1', email: 'joao@email.com', tipo: 'consumidor' });
    });

    it('deve lançar ConflictException se email já existir', async () => {
      mockDb.limit.mockResolvedValue([{ id: '1', email: 'joao@email.com' }]);

      await expect(service.register({ nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deve logar e retornar token para credenciais válidas', async () => {
      const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', senhaHash: 'hash' };

      mockDb.limit.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: 'joao@email.com', senha: '123456' });

      expect(result.user.email).toBe('joao@email.com');
      expect(result.accessToken).toBe('token');
    });

    it('deve lançar UnauthorizedException para email inexistente', async () => {
      mockDb.limit.mockResolvedValue([]);

      await expect(service.login({ email: 'x@x.com', senha: '123456' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para senha incorreta', async () => {
      mockDb.limit.mockResolvedValue([{ id: '1', email: 'joao@email.com', senhaHash: 'hash' }]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login({ email: 'joao@email.com', senha: 'errada' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('deve retornar dados do usuário', async () => {
      const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', saldoCreditos: 100, quantidadeDiamantes: 5, criadoEm: new Date() };

      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await service.me('1');

      expect(result).not.toBeNull();
      expect(result!.nome).toBe('João');
      expect(result!.saldoCreditos).toBe(100);
    });

    it('deve retornar null se usuário não existir', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await service.me('inexistente');

      expect(result).toBeNull();
    });
  });
});
