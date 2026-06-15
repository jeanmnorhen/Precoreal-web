import { Test, TestingModule } from '@nestjs/testing';
import { LojasController } from './lojas.controller';
import { LojasService } from './lojas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('LojasController', () => {
  let controller: LojasController;
  let service: LojasService;

  const mockService = {
    create: jest.fn(),
    findByProprietario: jest.fn(),
    findPublicProfile: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const user = { userId: 'user1', email: 'a@b.com', tipo: 'lojista' as const };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LojasController],
      providers: [{ provide: LojasService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockGuard)
      .compile();

    controller = module.get<LojasController>(LojasController);
    service = module.get<LojasService>(LojasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create() deve chamar service.create com userId e dto', async () => {
    const dto = {
      nome: 'Loja',
      enderecoRua: 'Rua',
      enderecoNumero: '1',
      enderecoBairro: 'Centro',
      enderecoCidade: 'SP',
      enderecoEstado: 'SP',
      enderecoCep: '01001000',
      latitude: '-23.5',
      longitude: '-46.6',
    };
    mockService.create.mockResolvedValue({ id: '1', nome: 'Loja' });

    const result = await controller.create(user, dto);

    expect(mockService.create).toHaveBeenCalledWith('user1', dto);
    expect(result.id).toBe('1');
  });

  it('listarMinhas() deve chamar service.findByProprietario com userId', async () => {
    mockService.findByProprietario.mockResolvedValue([{ id: 'loja1' }]);

    const result = await controller.listarMinhas(user);

    expect(mockService.findByProprietario).toHaveBeenCalledWith('user1');
    expect(result).toHaveLength(1);
  });

  it('findPublic() não usa guard e chama service.findPublicProfile', async () => {
    mockService.findPublicProfile.mockResolvedValue({ id: 'loja1', nome: 'Loja', anuncios: [] });

    const result = await controller.findPublic('loja1');

    expect(mockService.findPublicProfile).toHaveBeenCalledWith('loja1');
    expect(result.nome).toBe('Loja');
  });

  it('findOne() deve chamar service.findById', async () => {
    mockService.findById.mockResolvedValue({ id: 'loja1' });

    const result = await controller.findOne('loja1');

    expect(mockService.findById).toHaveBeenCalledWith('loja1');
    expect(result.id).toBe('loja1');
  });

  it('update() deve chamar service.update com userId e dto', async () => {
    const dto = { nome: 'Atualizada' };
    mockService.update.mockResolvedValue({ id: 'loja1', nome: 'Atualizada' });

    const result = await controller.update('loja1', user, dto);

    expect(mockService.update).toHaveBeenCalledWith('loja1', 'user1', dto);
    expect(result.nome).toBe('Atualizada');
  });

  it('remove() deve chamar service.delete com userId', async () => {
    mockService.delete.mockResolvedValue({ id: 'loja1' });

    const result = await controller.remove('loja1', user);

    expect(mockService.delete).toHaveBeenCalledWith('loja1', 'user1');
    expect(result.id).toBe('loja1');
  });
});
