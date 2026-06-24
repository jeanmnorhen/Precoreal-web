import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CnpjService } from '../cnpj.service';
import { LOJA_REPOSITORY } from '@precoreal/domain';
import type { ILojaRepository } from '@precoreal/domain';

@Processor('verificacao-cnpj', {
  concurrency: 5,
  settings: { backoffStrategy: (attempts: number) => Math.min(attempts * 1000, 10000) },
})
export class CnpjVerificationWorker extends WorkerHost {
  private readonly logger = new Logger(CnpjVerificationWorker.name);

  constructor(
    private readonly cnpjService: CnpjService,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {
    super();
  }

  async process(job: Job<{ lojaId: string; cnpj: string; nomeLoja: string }>): Promise<void> {
    const { lojaId, cnpj, nomeLoja } = job.data;

    try {
      const dados = await this.cnpjService.consultarCNPJ(cnpj);

      if (!dados) {
        this.logger.warn(`CNPJ ${cnpj} não encontrado na BrasilAPI para loja ${lojaId}`);
        return;
      }

      const nomeConsistente =
        dados.razaoSocial.toLowerCase().includes(nomeLoja.toLowerCase()) ||
        dados.nomeFantasia.toLowerCase().includes(nomeLoja.toLowerCase());

      if (nomeConsistente) {
        await this.lojaRepository.updateCnpjVerificacao(lojaId, true, new Date());
        this.logger.log(`CNPJ ${cnpj} verificado com sucesso para loja ${lojaId}`);
      } else {
        this.logger.warn(
          `Nome da loja "${nomeLoja}" não confere com Razão Social "${dados.razaoSocial}" ou Nome Fantasia "${dados.nomeFantasia}" para CNPJ ${cnpj}`
        );
      }
    } catch (err) {
      this.logger.error(`Falha ao verificar CNPJ ${cnpj} para loja ${lojaId}`, err);
      throw err;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} concluído para CNPJ ${job.data.cnpj}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} falhou para CNPJ ${job.data.cnpj}: ${err.message}`);
  }
}
