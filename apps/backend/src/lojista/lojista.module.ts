import { Module } from '@nestjs/common';
import { LojistaController } from './lojista.controller';
import { LojistaService } from './lojista.service';
import { LojistaGuard } from './lojista.guard';
import { StripeModule } from '../stripe/stripe.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, StripeModule],
  controllers: [LojistaController],
  providers: [LojistaService, LojistaGuard],
})
export class LojistaModule {}
