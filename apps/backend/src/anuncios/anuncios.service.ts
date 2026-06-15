import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { LojasService } from '../lojas/lojas.service';
import { ANUNCIO_REPOSITORY, USUARIO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository, IUsuarioRepository, AnuncioData } from '@precoreal/domain';
import { validarRegrasAnuncio, calcularNovaDataFim, validarSaldoSuficiente } from '@precoreal/domain';

@Injectable()
export class AnunciosService {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
    private readonly lojasService: LojasService,
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async create(dto: CreateAnuncioDto) {
    const tipo = dto.tipo || 'oferta';
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    const erros = validarRegrasAnuncio({ tipo, dataInicio, dataFim, custoCreditos: dto.custoCreditos, raioAlcanceKm: dto.raioAlcanceKm });
    if (erros.length > 0) throw new BadRequestException(erros[0].message);

    return this.anuncioRepo.create({
      lojaId: '',
      produtoId: dto.produtoId,
      titulo: dto.titulo,
      descricao: dto.descricao || null,
      tipo: tipo as AnuncioData['tipo'],
      raioAlcanceKm: dto.raioAlcanceKm,
      custoCreditos: dto.custoCreditos,
      dataInicio,
      dataFim,
      status: 'ativo',
    });
  }

  async findAll() {
    return this.anuncioRepo.findAll();
  }

  async findById(id: string) {
    const anuncio = await this.anuncioRepo.findById(id);
    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');
    return anuncio;
  }

  async update(id: string, dto: UpdateAnuncioDto) {
    const existente = await this.anuncioRepo.findById(id);
    if (!existente) throw new NotFoundException('Anúncio não encontrado.');

    const tipo = dto.tipo || existente.tipo;
    const dataInicio = dto.dataInicio ? new Date(dto.dataInicio) : existente.dataInicio;
    const dataFim = dto.dataFim ? new Date(dto.dataFim) : existente.dataFim;
    const custoCreditos = dto.custoCreditos ?? existente.custoCreditos;
    const raioAlcanceKm = dto.raioAlcanceKm ?? existente.raioAlcanceKm;

    const erros = validarRegrasAnuncio({
      tipo,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      custoCreditos,
      raioAlcanceKm,
    });
    if (erros.length > 0) throw new BadRequestException(erros[0].message);

    const anuncio = await this.anuncioRepo.update(id, {
      ...(dto.produtoId && { produtoId: dto.produtoId }),
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.descricao && { descricao: dto.descricao }),
      ...(dto.tipo && { tipo: dto.tipo as AnuncioData['tipo'] }),
      ...(dto.raioAlcanceKm && { raioAlcanceKm: dto.raioAlcanceKm }),
      ...(dto.custoCreditos && { custoCreditos: dto.custoCreditos }),
      ...(dto.dataInicio && { dataInicio: new Date(dto.dataInicio) }),
      ...(dto.dataFim && { dataFim: new Date(dto.dataFim) }),
      ...(dto.status && { status: dto.status as AnuncioData['status'] }),
    });

    return anuncio;
  }

  async delete(id: string) {
    const anuncio = await this.anuncioRepo.delete(id);
    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');
    return anuncio;
  }

  async renovar(id: string, usuarioId: string) {
    const anuncio = await this.anuncioRepo.findById(id);
    if (!anuncio) throw new NotFoundException('Anúncio não encontrado.');

    const minhasLojas = await this.lojasService.findByProprietario(usuarioId);
    const ehDono = minhasLojas.some((l) => l.id === anuncio.lojaId);
    if (!ehDono) throw new ForbiddenException('Este anúncio não pertence a uma loja sua.');

    const erros = validarRegrasAnuncio({
      tipo: anuncio.tipo,
      dataInicio: anuncio.dataInicio,
      dataFim: anuncio.dataFim,
      custoCreditos: anuncio.custoCreditos,
      raioAlcanceKm: anuncio.raioAlcanceKm,
    });
    if (erros.length > 0) throw new BadRequestException(erros[0].message);

    const novoFim = calcularNovaDataFim(anuncio);

    const user = await this.usuarioRepo.findById(usuarioId);
    if (!user) throw new BadRequestException('Usuário não encontrado.');

    const erroSaldo = validarSaldoSuficiente(user.saldoCreditos, anuncio.custoCreditos);
    if (erroSaldo) throw new BadRequestException(erroSaldo.message);

    await this.usuarioRepo.debitarCreditos(usuarioId, anuncio.custoCreditos);

    const atualizado = await this.anuncioRepo.update(id, { dataFim: novoFim });

    return {
      anuncio: atualizado!,
      creditosRestantes: user.saldoCreditos - anuncio.custoCreditos,
    };
  }
}
