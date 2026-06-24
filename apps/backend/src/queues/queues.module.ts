import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueuesService } from './queues.service';
import { NotificacoesProcessor } from './notificacoes.processor';
import { ImpressoesProcessor } from './impressoes.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT
          ? parseInt(process.env.REDIS_PORT, 10)
          : 6379,
      },
    }),
    BullModule.registerQueue(
      { name: 'notificacoes' },
      { name: 'impressoes' },
      { name: 'verificacao-cnpj' },
      { name: 'credito-gratis-mensal' },
      { name: 'credito-expiracao' },
    ),
  ],
  providers: [QueuesService, NotificacoesProcessor, ImpressoesProcessor],
  exports: [QueuesService],
})
export class QueuesModule {}
