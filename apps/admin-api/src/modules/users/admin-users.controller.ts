import { Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AccessPayload } from '../../common/access-payload.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { AdminUsersService } from './admin-users.service.js';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin:access')
export class AdminUsersController {
    constructor(private readonly service: AdminUsersService) {}

    @Get()
    list() {
        return this.service.list();
    }

    @Post(':id/ban')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('user:ban')
    ban(@Param('id') id: string, @Req() req: Request & { user: AccessPayload }) {
        return this.service.setStatus(id, true, BigInt(req.user.sub));
    }

    @Post(':id/unban')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('user:ban')
    unban(@Param('id') id: string, @Req() req: Request & { user: AccessPayload }) {
        return this.service.setStatus(id, false, BigInt(req.user.sub));
    }
}
