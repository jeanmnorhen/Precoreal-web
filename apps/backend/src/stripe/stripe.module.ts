import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
