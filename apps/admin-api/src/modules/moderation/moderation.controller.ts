import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AccessPayload } from '../../common/access-payload.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { ModerationService } from './moderation.service.js';

@ApiTags('admin-posts')
@ApiBearerAuth()
@Controller('admin/posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('post:review')
export class ModerationController {
    constructor(private readonly service: ModerationService) {}

    @Get()
    list(@Query('status') status = 'pending') {
        return this.service.list(status);
    }

    @Post(':id/approve')
    @HttpCode(HttpStatus.OK)
    approve(
        @Param('id') id: string,
        @Req() req: Request & { user: AccessPayload },
    ) {
        return this.service.approve(id, BigInt(req.user.sub));
    }

    @Post(':id/reject')
    @HttpCode(HttpStatus.OK)
    reject(
        @Param('id') id: string,
        @Body() body: { reason?: string },
        @Req() req: Request & { user: AccessPayload },
    ) {
        return this.service.reject(id, BigInt(req.user.sub), body.reason);
    }
}
