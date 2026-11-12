import { prisma } from '../common/db.ts'
import { logger } from '../common/logger.ts'
import { notificationQueue } from "./queue.ts";
import {clearInterval} from "node:timers";

let ticking = false;

async function tick() {
    if(ticking) return;
    ticking = true;
    try {
        const events = await prisma.outboxEvent.findMany({
            where: { status: 'pending' },
            orderBy: { id: 'desc' },
            take: 20,
        })

        for (const event of events) {
            const claimed = await prisma.outboxEvent.updateMany({
                where: { id: event.id, status: 'pending' },
                data: { status: 'processing' },
            })
            if (claimed.count === 0) continue

            try {
                await notificationQueue.add(event.type, event.payload, {
                    jobId: event.id.toString(),
                })
                await prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { status: 'done', processed: new Date() },
                });
            } catch (error) {
                await prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { status: 'failed', retryCount: { increment: 1 } },
                })
                logger.error({ err: error, eventId: event.id.toString() }, 'outbox dispatch failed');
            }
        }
    } finally {
        ticking = false;
    }
}

export function startOutboxWorker() {
    const timer = setInterval(() => void tick(), 1000);
    void tick();
    return () => clearInterval(timer);
}