import type { RequestHandler } from "express";
import { verifyAccessToken } from "../modules/auth/token.service.ts";
import { AppError } from "./errors.ts";

export const requireAuth: RequestHandler = (req, _res, next) => {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if(!token) return next(new AppError('UNAUTHORIZED', 401, 'Authentication required', 401));
    try {
        req.user = verifyAccessToken(token);
        next();
    } catch {
        next(new AppError('UNAUTHORIZED', 401, 'Invalid or expired token', 401));
    }
}

export const optionalAuth: RequestHandler = (req, _res, next) => {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if(!token) return next();
    try {
        req.user = verifyAccessToken(token);
    } catch {

    }
    next();
}