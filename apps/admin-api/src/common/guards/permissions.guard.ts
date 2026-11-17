import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AccessPayload } from '../access-payload.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required =
            this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) ?? [];

        const request = context.switchToHttp().getRequest<Request & { user?: AccessPayload }>();
        const granted = request.user?.permissions ?? [];
        if (!required.every((permission) => granted.includes(permission))) {
            throw new ForbiddenException('Permission denied');
        }
        return true;
    }
}
