import { config } from './common/config.ts';
import { logger } from './common/logger.ts';
import { startOutboxWorker } from "./jobs/outbox.worker.ts";
import './jobs/notification.worker.ts'
import { createApp } from "./app.js";

const app = createApp();
startOutboxWorker();

app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'API listening');
})