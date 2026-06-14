import { Module } from '@nestjs/common';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class IdempotencyModule {}
