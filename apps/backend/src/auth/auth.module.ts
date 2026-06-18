import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'precoreal-secret-dev',
      signOptions: { expiresIn: '7d' },
    }),
    RepositoriesModule,
    ApplicationModule,
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
