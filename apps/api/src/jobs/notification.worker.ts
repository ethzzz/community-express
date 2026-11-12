import { Worker } from 'bullmq';
import type { Prisma } from '@prisma/client';
import { prisma } from '../common/db.js';
import { logger } from '../common/logger.js';
import { redis } from '../common/redis.js';

type Payload = {
    actorId?: string;
    recipientId?: string;
    targetType?: string;
    targetId?: string;
    postId?: string;
    commentId?: string;
    followerId?: string;
    followeeId?: string;
};

function typeOf(name: string) {
    if (name === 'like.created') return 'like';
    if (name === 'comment.created') return 'comment';
    if (name === 'follow.created') return 'follow';
    return 'system'
}

export const notificationWorker = new Worker(
    'notification',
    async (job) => {
        if (!job.id) return;
        const payload = job.data as Payload;
        const actorId = payload.actorId ?? payload.followerId;
        const recipientId = payload.recipientId ?? payload.followeeId;
        if (!actorId || !recipientId || actorId === recipientId) return;

        const notification = await prisma.notification.upsert({
            where: { eventId: job.id },
            update: {},
            create: {
                eventId: job.id,
                userId: BigInt(recipientId),
                type: typeOf(job.name),
                actorId: BigInt(actorId),
                targetType: payload.targetType ?? (payload.postId ? 'post' : payload.commentId ? 'comment' : null),
                targetId: payload.targetId ?
                    BigInt(payload.targetId) : payload.postId ?
                    BigInt(payload.postId) : payload.commentId ?
                    BigInt(payload.commentId) : null,
                payload: payload as unknown as Prisma.InputJsonValue,
            }
        })

        await redis.publish(
            `notify:${recipientId}`,
            JSON.stringify({
                id: notification.id.toString(),
                type: notification.type,
                actorId: notification.actorId?.toString() ?? null,
                targetType: notification.targetType,
                targetId: notification.targetId?.toString() ?? null,
                createdAt: notification.createdAt,
            }),
        );
    },
    { connection: redis, concurrency: 10 },
);

notificationWorker.on('failed', (job, error) => {
    logger.error({ err: error, jobId: job?.id }, 'notification job failed');
})