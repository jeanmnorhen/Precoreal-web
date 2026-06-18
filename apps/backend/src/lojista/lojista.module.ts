import { Module } from '@nestjs/common';
import { LojistaController } from './lojista.controller';
import { LojistaGuard } from './lojista.guard';
import { StripeModule } from '../stripe/stripe.module';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [StripeModule, RepositoriesModule, ApplicationModule],
  controllers: [LojistaController],
  providers: [LojistaGuard],
})
export class LojistaModule {}
