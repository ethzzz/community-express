import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { parseId } from '../../common/parse-id.js';

const allowedStatuses = ['pending', 'resolved', 'rejected'] as const;
type ReportStatus = (typeof allowedStatuses)[number];

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaClient) {}

    async list(status = 'pending') {
        if (!allowedStatuses.includes(status as ReportStatus)) {
            throw new BadRequestException('Invalid report status');
        }

        const rows = await this.prisma.report.findMany({
            where: { status: status as ReportStatus },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 100,
        });

        return {
            items: rows.map((row) => ({
                ...row,
                id: row.id.toString(),
                targetId: row.targetId.toString(),
                handledBy: row.handledBy?.toString() ?? null,
                createdAt: row.createdAt.toISOString(),
            })),
        };
    }

    async resolve(id: string, action: 'resolve' | 'reject', operatorId: bigint) {
        const reportId = parseId(id, 'reportId');
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report) throw new NotFoundException('Report not found');

        const status: ReportStatus = action === 'resolve' ? 'resolved' : 'rejected';
        const updated = await this.prisma.report.update({
            where: { id: reportId },
            data: { status, handledBy: operatorId },
        });

        await this.prisma.moderationRecord.create({
            data: {
                targetType: 'report',
                targetId: reportId,
                action: `report:${action}`,
                operatorId,
                reason: report.reason,
            },
        });

        return {
            ...updated,
            id: updated.id.toString(),
            targetId: updated.targetId.toString(),
            handledBy: updated.handledBy?.toString() ?? null,
            createdAt: updated.createdAt.toISOString(),
        };
    }
}
