import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('notificacoes') private readonly notificacoesQueue: Queue,
    @InjectQueue('impressoes') private readonly impressoesQueue: Queue,
  ) {}

  async adicionarNotificacao(data: {
    usuarioId: string;
    titulo: string;
    mensagem: string;
  }) {
    await this.notificacoesQueue.add('enviar', data, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async registrarImpressao(data: {
    anuncioId: string;
    usuarioId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    await this.impressoesQueue.add(
      'log',
      { ...data, timestamp: new Date().toISOString() },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 500 },
      },
    );
  }
}
