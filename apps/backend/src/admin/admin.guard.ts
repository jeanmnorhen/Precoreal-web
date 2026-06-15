import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: JwtPayload }>();
    const user = request.user;

    if (!user || user.tipo !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
