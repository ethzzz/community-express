import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions} from 'jsonwebtoken';
import { config } from '../../common/config.ts';

export type AccessPayload = { sub: string; roles: string[] };

export function signAccessToken(payload: AccessPayload) {
    const expiresIn = '15m' as NonNullable<SignOptions['expiresIn']>;
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyAccessToken(token:string): AccessPayload {
    const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256']});
    if(typeof decoded === 'string') throw new Error('Invalid token payload');
    return {
        sub: String(decoded.sub),
        roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : []
    }
}

export function createRefreshToken() {
    const token = randomBytes(48).toString('base64url');
    return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}