import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { FastifyRequest } from 'fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true, bodyLimit: 1048576 }),
  );

  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (
      request: FastifyRequest,
      body: Buffer,
      done: (err: Error | null, body?: unknown) => void,
    ) => {
      (request as unknown as { rawBody: Buffer }).rawBody = body;
      try {
        const parsed = JSON.parse(body.toString('utf8')) as Record<
          string,
          unknown
        >;
        done(null, parsed);
      } catch (err) {
        done(err as Error);
      }
    },
  );

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validadores de payload globais
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
bootstrap();
