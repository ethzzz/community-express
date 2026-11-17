import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { ApiClient } from '../../clients/api-client.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';

@ApiTags('admin-dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin:access')
export class DashboardController {
    constructor(
        private readonly api: ApiClient,
        private readonly prisma: PrismaClient,
    ) {}

    @Get('stats')
    async stats() {
        const [stats, pendingReports] = await Promise.all([
            this.api.stats(),
            this.prisma.report.count({ where: { status: 'pending' } }),
        ]);
        return { ...stats, pendingReports };
    }
}
