import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';

@ApiTags('admin-audit')
@ApiBearerAuth()
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin:access')
export class AuditController {
    constructor(private readonly prisma: PrismaClient) {}

    @Get()
    async list(@Query('limit') limit = '50') {
        const take = Math.min(Number(limit) || 50, 200);
        const rows = await this.prisma.moderationRecord.findMany({
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take,
        });

        return {
            items: rows.map((row) => ({
                ...row,
                id: row.id.toString(),
                targetId: row.targetId.toString(),
                operatorId: row.operatorId.toString(),
                createdAt: row.createdAt.toISOString(),
            })),
        };
    }
}
