import { Redis } from 'ioredis'
import { config } from './config.ts'
import { logger } from './logger.ts'

export const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: 3000,
})

redis.on('error', (err) => {
    logger.error({ err }, 'redis error')
})
