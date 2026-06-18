import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY, Geolocalizacao } from '@precoreal/domain';
import type { ILojaRepository, LojaData } from '@precoreal/domain';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class AtualizarLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(input: {
    id: string;
    usuarioId: string;
    nome?: string;
    descricao?: string;
    enderecoRua?: string;
    enderecoNumero?: string;
    enderecoBairro?: string;
    enderecoCidade?: string;
    enderecoEstado?: string;
    enderecoCep?: string;
    latitude?: string;
    longitude?: string;
    logoUrl?: string;
    tabloideUrl?: string;
  }): Promise<LojaData> {
    const { id, usuarioId, latitude, longitude, ...rest } = input;

    const updateData: Record<string, unknown> = { ...rest };

    if (latitude && longitude) {
      updateData.localizacao = Geolocalizacao.create(Number(latitude), Number(longitude)).toWKT();
    }

    const loja = await this.lojaRepository.update(id, usuarioId, updateData as any);
    if (!loja) throw new NotFoundError('Loja não encontrada.');
    return loja;
  }
}
