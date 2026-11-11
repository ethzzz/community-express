import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { findFollowingFeed } from './feed.repository.js';

export const feedRouter = Router();

function parseCursor(raw: unknown): { cursorCreatedAt?: Date; cursorId?: bigint } {
    if (raw === undefined) return {};
    if (typeof raw !== 'string') throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');

    const separator = raw.lastIndexOf('_');
    if (separator < 1) throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');

    const createdAt = new Date(raw.slice(0, separator));
    const id = raw.slice(separator + 1);
    if (Number.isNaN(createdAt.getTime()) || !/^\d+$/.test(id)) {
        throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');
    }

    return { cursorCreatedAt: createdAt, cursorId: BigInt(id) };
}

feedRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const cursor = parseCursor(req.query.cursor);
    const rows = await findFollowingFeed({ userId: BigInt(req.user!.sub), limit, ...cursor });
    const page = rows.slice(0, limit);
    const last = page[page.length - 1];

    res.json({
        items: page.map((row) => ({
            ...row,
            id: String(row.id),
            author_id: String(row.author_id),
            author: {
                id: String(row.author_id),
                nickname: row.author_nickname,
                avatarUrl: row.author_avatar_url,
            },
        })),
        nextCursor: rows.length > limit && last
            ? `${new Date(last.created_at as string | Date).toISOString()}_${String(last.id)}`
            : null,
    });
}));