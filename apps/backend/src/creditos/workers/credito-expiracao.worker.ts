import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CreditosGratisService } from '../creditos-gratis.service';

@Processor('credito-expiracao', {
  concurrency: 1,
})
export class CreditoExpiracaoWorker extends WorkerHost {
  private readonly logger = new Logger(CreditoExpiracaoWorker.name);

  constructor(private readonly creditosGratisService: CreditosGratisService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log('Iniciando expiração de créditos grátis vencidos...');
    const total = await this.creditosGratisService.expirarCreditosVencidos();
    this.logger.log(`Expiração concluída: ${total} créditos expirados.`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job diário de expiração concluído: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job diário de expiração falhou: ${err.message}`);
  }
}
