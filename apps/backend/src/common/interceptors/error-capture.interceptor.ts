import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RedisService } from '../../redis/redis.service';
import { FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';

@Injectable()
export class ErrorCaptureInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        error: (err) => {
          try {
            const request = context.switchToHttp().getRequest<FastifyRequest>();
            const errorEntry = {
              id: randomUUID(),
              mensagem: err.message || 'Erro interno',
              metodo: request.method,
              url: request.url,
              statusCode: err.status || err.statusCode || 500,
              ocorridoEm: new Date().toISOString(),
            };
            const redis = this.redisService.redis;
            redis.lpush('recent_errors', JSON.stringify(errorEntry));
            redis.ltrim('recent_errors', 0, 99);
          } catch {}
        },
      }),
    );
  }
}
