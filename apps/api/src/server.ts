import { config } from './common/config.ts';
import { logger } from './common/logger.ts';
import { createApp } from "./app.js";

const app = createApp();

app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'API listening');
})