import { Module } from '@nestjs/common';
import { LojistaController } from './lojista.controller';
import { LojistaService } from './lojista.service';
import { LojistaGuard } from './lojista.guard';
import { StripeModule } from '../stripe/stripe.module';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [AuthModule, StripeModule, RepositoriesModule],
  controllers: [LojistaController],
  providers: [LojistaService, LojistaGuard],
})
export class LojistaModule {}
