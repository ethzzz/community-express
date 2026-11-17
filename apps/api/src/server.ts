import { config } from './common/config.ts';
import { prisma } from './common/db.ts';
import { logger } from './common/logger.ts';
import { redis } from './common/redis.ts';
import { notificationWorker } from './jobs/notification.worker.ts';
import { startOutboxWorker } from './jobs/outbox.worker.ts';
import { createApp } from './app.ts';

const app = createApp();
const stopOutbox = startOutboxWorker();
const server = app.listen(config.PORT);

logger.info({ port: config.PORT }, 'API listening');

let shuttingDown = false;

async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, 'shutting down');
    const force = setTimeout(() => process.exit(1), 10_000);
    const hardClose = setTimeout(() => server.closeAllConnections(), 5_000);

    server.close(async () => {
        clearTimeout(force);
        clearTimeout(hardClose);
        stopOutbox();
        await notificationWorker.close();
        await prisma.$disconnect();
        await redis.quit();
        process.exit(0);
    });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
