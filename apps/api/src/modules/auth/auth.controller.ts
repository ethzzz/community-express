import type { Request, Response } from "express";
import { config } from '../../common/config.ts';
import { AppError } from "../../common/errors.ts";
import { login, logout, refresh, register } from "./auth.service.ts";

const COOKIE = 'refresh_token';

function setCookie(res: Response, token: string) {
    res.cookie(COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.NODE_ENV === 'production',
        path: '/api/v1/auth',
        maxAge: config.JWT_REFRESH_TTL_DAYS * 86_400_000,
    });
}

export async function registerHandle(req: Request, res: Response): Promise<void> {
    res.status(201).json(await register(req.body));
}

export async function loginHandler(req: Request, res: Response) {
    const result = await login({ ...req.body, userAgent: req.header('user-agent'), ip: req.ip });
    setCookie(res, result.refreshToken);
    res.status(200).json({ accessToken: result.accessToken, user: result.user });
}

export async function refreshHandler(req: Request, res: Response) {
    const token = req.cookies[COOKIE] ?? req.body?.refreshToken;
    if(!token) throw new AppError('REFRESH_TOKEN_REQUIRED', 401, 'Refresh token required')
    const result = await refresh({ refreshToken: token });
    setCookie(res, result.refreshToken);
    res.status(200).json({ accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
    const token = req.cookies[COOKIE] ?? req.body?.refreshToken;
    if(token) await logout(token);
    res.clearCookie(COOKIE, { path: '/api/v1/auth' });
    res.status(204).send();
}