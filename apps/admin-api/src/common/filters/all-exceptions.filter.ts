import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const payload = exception instanceof HttpException ? exception.getResponse() : null;
        const message =
            typeof payload === 'string'
                ? payload
                : (payload as { message?: string | string[] } | null)?.message ??
                  'Internal server error';

        response.status(status).json({
            code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
            message,
            requestId: response.getHeader('x-request-id') ?? null,
        });
    }
}
