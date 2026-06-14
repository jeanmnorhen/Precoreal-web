import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

interface ImpressaoJobData {
  anuncioId: string;
  usuarioId?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

@Processor('impressoes', {
  concurrency: 10,
})
export class ImpressoesProcessor extends WorkerHost {
  async process(job: Job<ImpressaoJobData>): Promise<void> {
    const { anuncioId } = job.data;
    console.log(`[Impressao] Anuncio ${anuncioId} visualizado`);
  }
}
