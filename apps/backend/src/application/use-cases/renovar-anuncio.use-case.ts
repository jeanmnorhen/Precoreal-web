import { Injectable, Inject } from '@nestjs/common';
import {
  ANUNCIO_REPOSITORY, USUARIO_REPOSITORY, LOJA_REPOSITORY,
  Anuncio, Usuario, ValidationError,
} from '@precoreal/domain';
import type { IAnuncioRepository, IUsuarioRepository, ILojaRepository } from '@precoreal/domain';
import { NotFoundError, ForbiddenError, InsufficientBalanceError } from '../errors';

@Injectable()
export class RenovarAnuncioUseCase {
  constructor(
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepo: ILojaRepository,
  ) {}

  async execute(input: { anuncioId: string; usuarioId: string }) {
    const data = await this.anuncioRepo.findById(input.anuncioId);
    if (!data) throw new NotFoundError('Anúncio não encontrado.');

    const lojas = await this.lojaRepo.findByProprietario(input.usuarioId);
    const ehDono = lojas.some((l) => l.id === data.lojaId);
    if (!ehDono) throw new ForbiddenError('Este anúncio não pertence a uma loja sua.');

    const entity = new Anuncio(data);
    const erros = entity.validarRegras();
    if (erros.length > 0) throw erros[0];

    const userData = await this.usuarioRepo.findById(input.usuarioId);
    if (!userData) throw new NotFoundError('Usuário não encontrado.');

    const user = new Usuario(userData);
    const erroSaldo = user.validarSaldoSuficiente(entity.custoCreditos);
    if (erroSaldo) throw new InsufficientBalanceError(erroSaldo.message);

    const novoFim = entity.calcularNovaDataFim();
    await this.usuarioRepo.debitarCreditos(input.usuarioId, entity.custoCreditos);
    const atualizado = await this.anuncioRepo.update(input.anuncioId, { dataFim: novoFim });

    return {
      anuncio: atualizado!,
      creditosRestantes: user.saldoCreditos - entity.custoCreditos,
    };
  }
}
