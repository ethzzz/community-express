import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { ModerationModule } from './modules/moderation/moderation.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { AdminUsersModule } from './modules/users/admin-users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        ModerationModule,
        ReportsModule,
        AdminUsersModule,
        AuditModule,
        DashboardModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
