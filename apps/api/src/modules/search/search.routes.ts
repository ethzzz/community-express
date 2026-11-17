import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../../common/db.ts';
import { AppError } from '../../common/errors.ts';
import { asyncHandler } from '../../common/middleware.ts';
import { searchPosts } from '../../common/meili.ts';

const postSelect = {
    id: true,
    authorId: true,
    title: true,
    content: true,
    createdAt: true,
    author: { select: { id: true, nickname: true, avatarUrl: true } },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof postSelect }>;

const toPost = (post: PostRow) => ({
    ...post,
    id: post.id.toString(),
    authorId: post.authorId.toString(),
    author: { ...post.author, id: post.author.id.toString() },
});

export const searchRouter = Router();

searchRouter.get('/posts', asyncHandler(async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 50);
    if (!query) throw new AppError('QUERY_REQUIRED', 400, 'Search query is required');

    const indexed = await searchPosts(query, limit).catch(() => null);
    if (indexed) {
        res.json({ items: indexed, source: 'meilisearch' });
        return;
    }

    const rows = await prisma.post.findMany({
        where: {
            status: 'published',
            OR: [{ title: { contains: query } }, { content: { contains: query } }],
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit,
        select: postSelect,
    });

    res.json({ items: rows.map(toPost), source: 'mysql' });
}));
