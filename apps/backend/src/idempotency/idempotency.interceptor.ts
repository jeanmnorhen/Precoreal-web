import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Aplica idempotência apenas em métodos de escrita mutáveis
    const method = request.method;
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle();
    }

    const key = request.headers['x-idempotency-key'];
    if (!key) {
      return next.handle();
    }

    const redisKey = `idempotency:${key}`;
    const redis = this.redisService.redis;

    // Consulta o status atual da chave no cache
    const cached = await redis.get(redisKey);
    if (cached) {
      const { status, body } = JSON.parse(cached);
      if (status === 'PENDING') {
        throw new ConflictException(
          'Requisição em processamento. Aguarde antes de retransmitir.',
        );
      } else if (status === 'SUCCESS') {
        // Envia imediatamente a resposta em cache
        response.status(body.statusCode || 200);
        return of(body.data);
      }
    }

    // Cria bloqueio atômico com NX (Set if Not Exists) com expiração de 5 minutos
    const lockSet = await redis.set(
      redisKey,
      JSON.stringify({ status: 'PENDING' }),
      'EX',
      300,
      'NX',
    );

    if (!lockSet) {
      throw new ConflictException(
        'Requisição duplicada concorrente. Bloqueio atômico ativado.',
      );
    }

    return next.handle().pipe(
      map((data) => {
        // Grava o sucesso por 24 horas no Redis
        const responseBody = {
          status: 'SUCCESS',
          body: {
            statusCode: response.statusCode || 200,
            data,
          },
        };
        redis.set(redisKey, JSON.stringify(responseBody), 'EX', 86400);
        return data;
      }),
      catchError((err) => {
        // Se a transação der erro, desfaz o bloqueio atômico para permitir nova tentativa
        redis.del(redisKey);
        return throwError(() => err);
      }),
    );
  }
}
