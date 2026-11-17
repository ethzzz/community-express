import type { RequestHandler } from 'express';
import { config } from './config.ts';
import { AppError } from './errors.ts';

export const requireInternalToken: RequestHandler = (req, _res, next) => {
    const token = req.header('x-internal-token');
    if (!token || token !== config.INTERNAL_API_TOKEN) {
        return next(new AppError('UNAUTHORIZED', 401, 'Invalid internal token'));
    }
    next();
};
