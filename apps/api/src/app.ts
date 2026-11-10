import express from 'express';
import type { Express } from 'express';
import { asyncHandler, errorHandler, notFound, requestId} from "./common/middleware.ts";

export const createApp = () : Express => {
    const app = express();

    app.use(requestId);
    app.use(express.json({ limit: "1mb" }));

    app.get('/health', (_req, res) => {
        res.status(200).json({ status: "OK" });
    })

    app.get('/boom', asyncHandler(async() => {
        throw new Error('boom')
    }))

    app.use(notFound);
    app.use(errorHandler);

    return app;
}