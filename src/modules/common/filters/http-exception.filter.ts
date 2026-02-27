import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error | HttpException | MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Log the error with stack trace
    this.logger.error(`Exception: ${exception.message}`, exception.stack);

    // Handle MongoDB duplicate key error
    if (exception instanceof MongoError && exception.code === 11000) {
      const duplicatedKeys = Object.keys(exception['keyValue'] || {});
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `Duplicate key error for fields: ${duplicatedKeys.join(', ')}`,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(process.env.NODE_ENV !== 'production' && {
          details: exception['keyValue'],
        }),
      });
      return;
    }

    // Handle HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exceptionResponse;

      // Ensure arrays are preserved (e.g., validation errors)
      if (Array.isArray(message)) {
        message = message;
      }

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(process.env.NODE_ENV !== 'production' && {
          stack: exception.stack,
        }),
      });
      return;
    }

    // Handle all other errors (generic 500)
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message || 'Unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: exception.stack,
      }),
    });
  }
}
