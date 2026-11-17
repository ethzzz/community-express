import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { requireInternalToken } from '../../common/internal-auth.ts';
import { prisma } from '../../common/db.ts';
import { AppError } from '../../common/errors.ts';
import { asyncHandler } from '../../common/middleware.ts';
import { parseBigIntId } from '../../common/params.ts';

const postSelect = {
    id: true,
    authorId: true,
    title: true,
    content: true,
    status: true,
    likeCount: true,
    commentCount: true,
    createdAt: true,
    author: { select: { id: true, nickname: true, email: true } },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof postSelect }>;

const toPost = (post: PostRow) => ({
    ...post,
    id: post.id.toString(),
    authorId: post.authorId.toString(),
    author: { ...post.author, id: post.author.id.toString() },
});

const allowedStatuses = ['pending', 'published', 'rejected'] as const;

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

internalRouter.get('/posts', asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    if (status && !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
        throw new AppError('INVALID_STATUS', 400, 'Invalid post status');
    }

    const take = Math.min(Number(req.query.limit ?? 50) || 50, 100);
    const posts = await prisma.post.findMany({
        where: status ? { status: status as (typeof allowedStatuses)[number] } : { status: { not: 'deleted' } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take,
        select: postSelect,
    });

    res.json({ items: posts.map(toPost) });
}));

internalRouter.post('/posts/:id/status', asyncHandler(async (req, res) => {
    const status = req.body?.status;
    if (!allowedStatuses.includes(status)) {
        throw new AppError('INVALID_STATUS', 400, 'Invalid post status');
    }

    const id = parseBigIntId(req.params.id, 'postId');
    const updated = await prisma.post.updateMany({
        where: { id, status: { not: 'deleted' } },
        data: { status },
    });
    if (updated.count === 0) throw new AppError('POST_NOT_FOUND', 404, 'Post not found');

    const post = await prisma.post.findUniqueOrThrow({ where: { id }, select: postSelect });
    res.json(toPost(post));
}));

internalRouter.get('/users', asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 100,
        select: {
            id: true,
            email: true,
            nickname: true,
            status: true,
            createdAt: true,
            roles: { include: { role: true } },
        },
    });

    res.json({
        items: users.map((user) => ({
            ...user,
            id: user.id.toString(),
            roles: user.roles.map((entry) => entry.role.code),
        })),
    });
}));

async function setUserStatus(id: bigint, banned: boolean) {
    const user = await prisma.user.updateMany({
        where: { id, status: { not: 'deleted' } },
        data: { status: banned ? 'banned' : 'active' },
    });
    if (user.count === 0) throw new AppError('USER_NOT_FOUND', 404, 'User not found');

    if (banned) {
        await prisma.refreshToken.updateMany({
            where: { userId: id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    return { id: id.toString(), status: banned ? 'banned' : 'active' };
}

internalRouter.post('/users/:id/ban', asyncHandler(async (req, res) => {
    res.json(await setUserStatus(parseBigIntId(req.params.id, 'userId'), true));
}));

internalRouter.post('/users/:id/unban', asyncHandler(async (req, res) => {
    res.json(await setUserStatus(parseBigIntId(req.params.id, 'userId'), false));
}));

internalRouter.get('/stats', asyncHandler(async (_req, res) => {
    const [pendingPosts, publishedPosts, users, bannedUsers] = await prisma.$transaction([
        prisma.post.count({ where: { status: 'pending' } }),
        prisma.post.count({ where: { status: 'published' } }),
        prisma.user.count(),
        prisma.user.count({ where: { status: 'banned' } }),
    ]);

    res.json({ pendingPosts, publishedPosts, users, bannedUsers });
}));
