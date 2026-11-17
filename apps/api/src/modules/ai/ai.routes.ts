import { Router } from 'express';
import { requireAuth } from '../../common/auth.ts';
import { AppError } from '../../common/errors.ts';
import { asyncHandler } from '../../common/middleware.ts';
import { streamChat } from './ai.service.ts';

export const aiRouter = Router();

aiRouter.post('/chat', requireAuth, asyncHandler(async (req, res) => {
    const message = String(req.body?.message ?? '').trim();
    if (!message) throw new AppError('MESSAGE_REQUIRED', 400, 'Message is required');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
        for await (const token of streamChat(message, controller.signal)) {
            if (controller.signal.aborted) break;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
        res.write('event: done\ndata: [DONE]\n\n');
    } catch (error) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'AI unavailable' })}\n\n`);
    } finally {
        res.end();
    }
}));
