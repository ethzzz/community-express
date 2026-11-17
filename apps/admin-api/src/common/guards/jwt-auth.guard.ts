import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AccessPayload } from '../access-payload.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwt: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { user?: AccessPayload }>();
        const header = request.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
        if (!token) throw new UnauthorizedException('Authentication required');

        let payload: AccessPayload;
        try {
            payload = await this.jwt.verifyAsync<AccessPayload>(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (!Array.isArray(payload.roles) || !payload.roles.includes('admin')) {
            throw new ForbiddenException('Admin role required');
        }

        request.user = {
            sub: String(payload.sub),
            roles: payload.roles,
            permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
        };
        return true;
    }
}
