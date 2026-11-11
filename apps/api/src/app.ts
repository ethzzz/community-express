import cookieParser from "cookie-parser";
import cors from "cors";
import express from 'express';
import type { Express } from 'express';
import { config } from './common/config.ts'
import { asyncHandler, errorHandler, notFound, requestId} from "./common/middleware.ts";
import { authRouter } from "./modules/auth/auth.routes.ts";
import { feedRouter } from "./modules/feed/feed.routes.ts";
import { postsRouter } from "./modules/posts/posts.routes.ts";
import { usersRouter } from "./modules/users/users.routes.ts";

export const createApp = () : Express => {
    const app = express();

    app.use(requestId);
    app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
    app.use(cookieParser());
    app.use(express.json({ limit: "1mb" }));

    app.get('/health', (_req, res) => {
        res.status(200).json({ status: "OK" });
    })

    app.get('/boom', asyncHandler(async() => {
        throw new Error('boom')
    }))

    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/feed', feedRouter);
    app.use('/api/v1/posts', postsRouter);
    app.use('/api/v1/users', usersRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}