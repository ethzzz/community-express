import { Queue } from 'bullmq';
import { redis } from '../common/redis.ts';

export const notificationQueue = new Queue('notification', {
    connection: redis,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000
    }
});