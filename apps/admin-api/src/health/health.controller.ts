import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller()
export class HealthController {
    constructor(private readonly prisma: PrismaClient) {}

    @Get('health')
    health() {
        return { status: 'ok', service: 'admin-api' };
    }

    @Get('ready')
    async ready() {
        await this.prisma.$queryRaw`SELECT 1`;
        return { status: 'ready' };
    }
}
