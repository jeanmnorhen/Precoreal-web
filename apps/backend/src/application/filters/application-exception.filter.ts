import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NotFoundError } from '../errors/not-found.error';
import { ForbiddenError } from '../errors/forbidden.error';
import { ConflictError } from '../errors/conflict.error';
import { InsufficientBalanceError } from '../errors/insufficient-balance.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { ValidationError } from '@precoreal/domain';

@Catch(NotFoundError, ForbiddenError, ConflictError, InsufficientBalanceError, UnauthorizedError, ValidationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus: HttpStatus;
    let body: Record<string, unknown>;

    if (exception instanceof NotFoundError) {
      httpStatus = HttpStatus.NOT_FOUND;
      body = { statusCode: httpStatus, message: exception.message, error: 'Not Found' };
    } else if (exception instanceof ForbiddenError) {
      httpStatus = HttpStatus.FORBIDDEN;
      body = { statusCode: httpStatus, message: exception.message, error: 'Forbidden' };
    } else if (exception instanceof ConflictError) {
      httpStatus = HttpStatus.CONFLICT;
      body = { statusCode: httpStatus, message: exception.message, error: 'Conflict' };
    } else if (exception instanceof InsufficientBalanceError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      body = { statusCode: httpStatus, message: exception.message, error: 'Bad Request' };
    } else if (exception instanceof UnauthorizedError) {
      httpStatus = HttpStatus.UNAUTHORIZED;
      body = { statusCode: httpStatus, message: exception.message, error: 'Unauthorized' };
    } else if (exception instanceof ValidationError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      body = {
        statusCode: httpStatus,
        message: exception.message,
        error: 'Bad Request',
        ...(exception.field && { field: exception.field }),
      };
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      body = { statusCode: httpStatus, message: 'Internal Server Error', error: 'Internal Server Error' };
    }

    httpAdapter.reply(ctx.getResponse(), body, httpStatus);
  }
}
