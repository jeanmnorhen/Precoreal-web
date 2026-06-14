"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const anuncios_service_1 = require("./anuncios.service");
const scoped_anuncio_repository_1 = require("../db/scoped-anuncio.repository");
const mockRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
describe('AnunciosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                anuncios_service_1.AnunciosService,
                { provide: scoped_anuncio_repository_1.ScopedAnuncioRepository, useValue: mockRepo },
            ],
        }).compile();
        service = module.get(anuncios_service_1.AnunciosService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('deve criar anúncio', async () => {
        const dto = {
            produtoId: 'prod1',
            titulo: 'Oferta',
            descricao: 'Desc',
            raioAlcanceKm: 5,
            custoCreditos: 100,
            dataInicio: '2026-06-01',
            dataFim: '2026-07-01',
        };
        const created = { id: 'anuncio1', ...dto };
        mockRepo.create.mockResolvedValue(created);
        const result = await service.create(dto);
        expect(result).toEqual(created);
        expect(mockRepo.create).toHaveBeenCalledWith({
            ...dto,
            dataInicio: new Date('2026-06-01'),
            dataFim: new Date('2026-07-01'),
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
        await expect(service.findById('inexistente')).rejects.toThrow(common_1.NotFoundException);
    });
    it('deve atualizar anúncio', async () => {
        const updated = { id: '1', titulo: 'Atualizado', status: 'ativo' };
        mockRepo.update.mockResolvedValue(updated);
        const result = await service.update('1', { titulo: 'Atualizado', status: 'ativo' });
        expect(result).toEqual(updated);
    });
    it('deve lançar NotFoundException ao atualizar anúncio inexistente', async () => {
        mockRepo.update.mockResolvedValue(null);
        await expect(service.update('inexistente', { titulo: 'X' })).rejects.toThrow(common_1.NotFoundException);
    });
    it('deve deletar anúncio', async () => {
        const deleted = { id: '1' };
        mockRepo.delete.mockResolvedValue(deleted);
        const result = await service.delete('1');
        expect(result).toEqual(deleted);
    });
    it('deve lançar NotFoundException ao deletar anúncio inexistente', async () => {
        mockRepo.delete.mockResolvedValue(null);
        await expect(service.delete('inexistente')).rejects.toThrow(common_1.NotFoundException);
    });
});
