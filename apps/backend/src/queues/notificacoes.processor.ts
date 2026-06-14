import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

interface NotificacaoJobData {
  usuarioId: string;
  titulo: string;
  mensagem: string;
}

@Processor('notificacoes', {
  settings: {
    backoffStrategy: (attemptsMade: number) => Math.pow(2, attemptsMade) * 1000,
  },
  concurrency: 5,
})
export class NotificacoesProcessor extends WorkerHost {
  async process(job: Job<NotificacaoJobData>): Promise<void> {
    const { usuarioId, titulo } = job.data;

    console.log(`[Notificacao] Enviando para usuario ${usuarioId}: ${titulo}`);

    await this.simularEnvio();
  }

  private async simularEnvio(): Promise<void> {
    const delay = Math.floor(Math.random() * 100) + 50;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<NotificacaoJobData>) {
    console.log(
      `[Notificacao] Job ${job.id} concluido para ${job.data.usuarioId}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<NotificacaoJobData>, error: Error) {
    console.error(`[Notificacao] Job ${job.id} falhou: ${error.message}`);
  }
}
