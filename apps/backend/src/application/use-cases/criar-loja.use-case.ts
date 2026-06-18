import { Injectable, Inject } from '@nestjs/common';
import { LOJA_REPOSITORY, Geolocalizacao } from '@precoreal/domain';
import type { ILojaRepository, LojaData } from '@precoreal/domain';

@Injectable()
export class CriarLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(input: {
    usuarioId: string;
    nome: string;
    descricao?: string;
    enderecoRua: string;
    enderecoNumero: string;
    enderecoBairro: string;
    enderecoCidade: string;
    enderecoEstado: string;
    enderecoCep: string;
    latitude: string;
    longitude: string;
    logoUrl?: string;
  }): Promise<LojaData> {
    const localizacao = Geolocalizacao.create(Number(input.latitude), Number(input.longitude)).toWKT();

    const loja = await this.lojaRepository.create({
      usuarioProprietarioId: input.usuarioId,
      nome: input.nome,
      descricao: input.descricao ?? null,
      enderecoRua: input.enderecoRua,
      enderecoNumero: input.enderecoNumero,
      enderecoBairro: input.enderecoBairro,
      enderecoCidade: input.enderecoCidade,
      enderecoEstado: input.enderecoEstado,
      enderecoCep: input.enderecoCep,
      localizacao,
      perimetro: null,
      perimetroRaioMetros: 300,
      logoUrl: input.logoUrl ?? null,
      tabloideUrl: null,
    });

    return loja;
  }
}
