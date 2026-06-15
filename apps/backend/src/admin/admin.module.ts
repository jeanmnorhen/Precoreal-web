import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { AuthModule } from '../auth/auth.module';
import { ErrorCaptureInterceptor } from '../common/interceptors/error-capture.interceptor';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorCaptureInterceptor,
    },
  ],
})
export class AdminModule {}
