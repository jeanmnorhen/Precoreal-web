import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { FastifyRequest } from 'fastify';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'crypto';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_BACKEND,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      },
      bodyLimit: 1048576,
      genReqId: () => randomUUID(),
    }),
  );

  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.addHook('onRequest', async (request: FastifyRequest) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request.raw) {
      chunks.push(chunk);
    }
    (request as unknown as { rawBody: Buffer }).rawBody = Buffer.concat(chunks);
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  Sentry.captureException(err);
  console.error(err);
  process.exit(1);
});
