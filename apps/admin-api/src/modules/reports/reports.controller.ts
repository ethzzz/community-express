import {
    BadRequestException,
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
import { ReportsService } from './reports.service.js';

@ApiTags('admin-reports')
@ApiBearerAuth()
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('report:handle')
export class ReportsController {
    constructor(private readonly service: ReportsService) {}

    @Get()
    list(@Query('status') status = 'pending') {
        return this.service.list(status);
    }

    @Post(':id/resolve')
    @HttpCode(HttpStatus.OK)
    resolve(
        @Param('id') id: string,
        @Body() body: { action?: 'resolve' | 'reject' },
        @Req() req: Request & { user: AccessPayload },
    ) {
        if (body.action !== 'resolve' && body.action !== 'reject') {
            throw new BadRequestException('action must be resolve or reject');
        }
        return this.service.resolve(id, body.action, BigInt(req.user.sub));
    }
}
