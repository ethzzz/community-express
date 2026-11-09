import express from 'express';
import type { Express } from 'express';

export const createApp = () : Express => {
    const app = express();

    app.use(express.json({ limit: "1mb" }));

    app.get('/health', (_req, res) => {
        res.status(200).json({ status: "OK" });
    })

    return app;
}