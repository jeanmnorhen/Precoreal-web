import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'precoreal-secret-dev',
      signOptions: { expiresIn: '7d' },
    }),
    RepositoriesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
