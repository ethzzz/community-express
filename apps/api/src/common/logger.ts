import pino from 'pino';
import { config } from './config.ts';

export const logger = pino({
    level: config.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'password',
          '*.password',
          'token',
          '*.token',
        ],
        censor: '[REDACTED]',
    }
})