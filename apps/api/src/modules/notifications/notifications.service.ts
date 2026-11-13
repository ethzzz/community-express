import { prisma } from '../../common/db.ts'

export async function listNotifications(userId: bigint, limit = 20) {
    const rows = await prisma.notification.findMany({
        where: { userId },
        orderBy: [{ createAt: 'desc'}, { id: 'desc'}],
        take: limit,
    });
    return rows.map((row) => ({
        ...row,
        id: row.id.toString(),
        userId: row.userId.toString(),
        actorId: row.actorId?.toString() ?? null,
        targetId: row.targetId?.toString() ?? null,
    }));
}

export async function markRead(userId: bigint) {
    const result = await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
    });
    return { updated: result.count };
}