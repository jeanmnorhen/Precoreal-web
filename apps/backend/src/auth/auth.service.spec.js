"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const auth_service_1 = require("./auth.service");
const database_service_1 = require("../db/database.service");
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
    let service;
    let jwtService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: database_service_1.DatabaseService, useValue: { get database() { return mockDb; } } },
                { provide: jwt_1.JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('token') } },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        jwtService = module.get(jwt_1.JwtService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('register', () => {
        it('deve registrar um novo usuário e retornar token', async () => {
            const dto = { nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' };
            const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', senhaHash: 'hash' };
            mockDb.limit.mockResolvedValue([]);
            mockDb.returning.mockResolvedValue([mockUser]);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash');
            const result = await service.register(dto);
            expect(result.user.email).toBe('joao@email.com');
            expect(result.accessToken).toBe('token');
            expect(jwtService.signAsync).toHaveBeenCalledWith({ userId: '1', email: 'joao@email.com', tipo: 'consumidor' });
        });
        it('deve lançar ConflictException se email já existir', async () => {
            mockDb.limit.mockResolvedValue([{ id: '1', email: 'joao@email.com' }]);
            await expect(service.register({ nome: 'João', email: 'joao@email.com', senha: '123456', tipo: 'consumidor' }))
                .rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('login', () => {
        it('deve logar e retornar token para credenciais válidas', async () => {
            const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', senhaHash: 'hash' };
            mockDb.limit.mockResolvedValue([mockUser]);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            const result = await service.login({ email: 'joao@email.com', senha: '123456' });
            expect(result.user.email).toBe('joao@email.com');
            expect(result.accessToken).toBe('token');
        });
        it('deve lançar UnauthorizedException para email inexistente', async () => {
            mockDb.limit.mockResolvedValue([]);
            await expect(service.login({ email: 'x@x.com', senha: '123456' }))
                .rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException para senha incorreta', async () => {
            mockDb.limit.mockResolvedValue([{ id: '1', email: 'joao@email.com', senhaHash: 'hash' }]);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
            await expect(service.login({ email: 'joao@email.com', senha: 'errada' }))
                .rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('me', () => {
        it('deve retornar dados do usuário', async () => {
            const mockUser = { id: '1', nome: 'João', email: 'joao@email.com', tipo: 'consumidor', saldoCreditos: 100, quantidadeDiamantes: 5, criadoEm: new Date() };
            mockDb.limit.mockResolvedValue([mockUser]);
            const result = await service.me('1');
            expect(result).not.toBeNull();
            expect(result.nome).toBe('João');
            expect(result.saldoCreditos).toBe(100);
        });
        it('deve retornar null se usuário não existir', async () => {
            mockDb.limit.mockResolvedValue([]);
            const result = await service.me('inexistente');
            expect(result).toBeNull();
        });
    });
});
