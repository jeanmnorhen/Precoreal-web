import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseModule } from '../db/database.module';
import { CreditosGratisService } from './creditos-gratis.service';
import { CreditoGratisMensalWorker } from './workers/credito-gratis-mensal.worker';
import { CreditoExpiracaoWorker } from './workers/credito-expiracao.worker';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue(
      { name: 'credito-gratis-mensal' },
      { name: 'credito-expiracao' },
    ),
  ],
  providers: [CreditosGratisService, CreditoGratisMensalWorker, CreditoExpiracaoWorker],
  exports: [CreditosGratisService],
})
export class CreditosGratisModule implements OnModuleInit {
  constructor(
    @InjectQueue('credito-gratis-mensal') private readonly mensalQueue: Queue,
    @InjectQueue('credito-expiracao') private readonly expiracaoQueue: Queue,
  ) {}

  async onModuleInit() {
    // Agendar job mensal: 1º dia de cada mês às 00:00
    await this.mensalQueue.upsertJobScheduler(
      'credito-gratis-mensal-scheduler',
      { pattern: '0 0 1 * *' },
      { name: 'conceder' },
    );

    // Agendar job diário: todos os dias às 01:00
    await this.expiracaoQueue.upsertJobScheduler(
      'credito-expiracao-scheduler',
      { pattern: '0 1 * * *' },
      { name: 'expirar' },
    );
  }
}
