import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CreditosGratisService } from '../creditos-gratis.service';

@Processor('credito-gratis-mensal', {
  concurrency: 1,
})
export class CreditoGratisMensalWorker extends WorkerHost {
  private readonly logger = new Logger(CreditoGratisMensalWorker.name);

  constructor(private readonly creditosGratisService: CreditosGratisService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log('Iniciando concessão de créditos grátis mensais...');
    const total = await this.creditosGratisService.concederCreditosMensais();
    this.logger.log(`Concessão concluída: ${total} lojistas receberam créditos.`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job mensal de créditos grátis concluído: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job mensal de créditos grátis falhou: ${err.message}`);
  }
}
