import type { RequestHandler } from 'express';
import { collectDefaultMetrics, Histogram, Registry } from 'prom-client';

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const httpDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [metricsRegistry],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
    const end = httpDuration.startTimer();
    res.on('finish', () => {
        end({
            method: req.method,
            route: req.route?.path ?? req.path,
            status: String(res.statusCode),
        });
    });
    next();
};
