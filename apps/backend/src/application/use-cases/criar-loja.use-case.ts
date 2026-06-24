import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LOJA_REPOSITORY, Geolocalizacao } from '@precoreal/domain';
import type { ILojaRepository, LojaData } from '@precoreal/domain';
import { CnpjService } from '../../cnpj/cnpj.service';

@Injectable()
export class CriarLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    private readonly cnpjService: CnpjService,
    @InjectQueue('verificacao-cnpj') private readonly cnpjQueue: Queue,
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
    cnpj: string;
  }): Promise<LojaData> {
    const cnpjLimpo = input.cnpj.replace(/[^\d]/g, '');

    if (!this.cnpjService.validarLocalmente(cnpjLimpo)) {
      throw new BadRequestException('CNPJ inválido. Verifique o número informado.');
    }

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
      cnpj: cnpjLimpo,
      cnpjVerificado: false,
      cnpjVerificadoEm: null,
    } as any);

    await this.cnpjQueue.add('verificar', {
      lojaId: loja.id,
      cnpj: cnpjLimpo,
      nomeLoja: input.nome,
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return loja;
  }
}
