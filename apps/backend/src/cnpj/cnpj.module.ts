import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CnpjService } from './cnpj.service';
import { CnpjVerificationWorker } from './workers/cnpj-verification.worker';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'verificacao-cnpj' }),
    RepositoriesModule,
  ],
  providers: [CnpjService, CnpjVerificationWorker],
  exports: [CnpjService],
})
export class CnpjModule {}
