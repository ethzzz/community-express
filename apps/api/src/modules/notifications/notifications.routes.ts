import { Router } from 'express';
import { requireAuth } from "../../common/auth.ts";
import { asyncHandler } from "../../common/middleware.ts";
import { redis } from '../../common/redis.ts';
import { listNotifications, markRead } from "./notifications.service.ts";
import {clearInterval} from "node:timers";

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
    res.json({ items: await listNotifications(BigInt(req.user!.sub ))})
}))

notificationsRouter.post('/read', requireAuth, asyncHandler(async (req, res) => {
    res.json(await markRead(BigInt(req.user!.sub )));
}))

notificationsRouter.get('/stream', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    // 关掉 Nginx缓冲，否则时间会被攒到连接结束才发出去
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const subscriber = redis.duplicate();
    await subscriber.subscribe(`notify:${userId}`);

    let closed = false;
    subscriber.on('message', (_channel, message) => {
        if(!closed) res.write(`event: notification\ndata:${message}\n\n`)
    })

    // 心跳防止代理把长时间没有数据的 SSE 连接断掉
    const heartbeat = setInterval(() => {
        if (!closed) res.write(': ping\n\n')
    }, 15000);

    // 客户端断开必须清理订阅，否则 Redis 连接会泄漏
    req.on('close', () => {
        closed = true;
        clearInterval(heartbeat);
        void subscriber.unsubscribe(`notify:${userId}`);
        subscriber.disconnect();
    })
}))