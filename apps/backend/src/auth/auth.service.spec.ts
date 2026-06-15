import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USUARIO_REPOSITORY } from '@precoreal/domain';
import type { IUsuarioRepository } from '@precoreal/domain';
import { AuthService } from './auth.service';

const mockUsuarioRepository = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  debitarCreditos: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usuarioRepo: jest.Mocked<IUsuarioRepository>;

  const build = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USUARIO_REPOSITORY, useValue: usuarioRepo },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar um novo usuário e retornar token', async () => {
      const dto = { nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' as const };
      const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', senhaHash: 'hash', saldoCreditos: 0, quantidadeDiamantes: 0, criadoEm: new Date() };

      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findByEmail.mockResolvedValue(null);
      usuarioRepo.create.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as never);
      await build();

      const result = await service.register(dto);

      expect(result.user.email).toBe('joao@email.com');
      expect(result.accessToken).toBe('token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({ userId: '1', email: 'joao@email.com', tipo: 'consumidor' });
    });

    it('deve lançar ConflictException se email já existir', async () => {
      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findByEmail.mockResolvedValue({ id: '1', email: 'joao@email.com' } as any);
      await build();

      await expect(service.register({ nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deve logar e retornar token para credenciais válidas', async () => {
      const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', senhaHash: 'hash' };

      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      await build();

      const result = await service.login({ email: 'joao@email.com', senha: '123456' });

      expect(result.user.email).toBe('joao@email.com');
      expect(result.accessToken).toBe('token');
    });

    it('deve lançar UnauthorizedException para email inexistente', async () => {
      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findByEmail.mockResolvedValue(null);
      await build();

      await expect(service.login({ email: 'x@x.com', senha: '123456' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para senha incorreta', async () => {
      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findByEmail.mockResolvedValue({ id: '1', email: 'joao@email.com', senhaHash: 'hash' } as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await build();

      await expect(service.login({ email: 'joao@email.com', senha: 'errada' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('deve retornar dados do usuário', async () => {
      const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', saldoCreditos: 100, quantidadeDiamantes: 5, criadoEm: new Date() };

      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findById.mockResolvedValue(mockUser as any);
      await build();

      const result = await service.me('1');

      expect(result).not.toBeNull();
      expect(result!.nome).toBe('João');
      expect(result!.saldoCreditos).toBe(100);
    });

    it('deve retornar null se usuário não existir', async () => {
      usuarioRepo = mockUsuarioRepository();
      usuarioRepo.findById.mockResolvedValue(null);
      await build();

      const result = await service.me('inexistente');

      expect(result).toBeNull();
    });
  });
});
