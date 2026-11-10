import { randomUUID } from "node:crypto";
import type {
    ErrorRequestHandler,
    NextFunction,
    Request,
    RequestHandler,
    Response
} from "express";
import { ZodError } from 'zod';
import { AppError} from "./errors.ts";
import { logger } from "./logger.ts";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/

export const requestId: RequestHandler = (req, res, next)=> {
    const incoming = req.header('x-request-id');
    const id = incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();

    res.locals.requestId = id;
    res.setHeader('x-request-id', id);
    next();
}

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncRoute): RequestHandler {
    return (req, res, next) => {
        Promise.resolve()
            .then(() => handler(req, res, next))
            .catch(next);
    }
}

export const notFound: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError('NOT_FOUND', 404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const requestId = String(res.locals.requestId);

    if(err instanceof AppError) {
        logger.warn({ err, requestId }, 'request failed');
        res.status(err.status).json({
            code: err.code,
            message: err.message,
            details: err.details ?? null,
            requestId,
        })
        return;
    }

    if(err instanceof ZodError) {
        logger.warn({ err, requestId }, 'validation failed');
        res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: err.issues,
            requestId,
        })
        return;
    }

    if(err instanceof SyntaxError && 'body' in err) {
        logger.warn({ err, requestId }, 'invalid json body');
        res.status(400).json({
            code: 'INVALID_JSON',
            message: 'Request body is not valid JSON',
            requestId,
        });
        return;
    }

    logger.error({ err, requestId }, 'unhandled error');
    res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        requestId
    })
}
