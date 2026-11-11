import { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.ts';

export async function findFollowingFeed(input: {
    userId: bigint;
    cursorCreatedAt?: Date;
    cursorId?: bigint;
    limit: number;
}) {
    const { userId, cursorCreatedAt, cursorId, limit } = input;

    if(cursorCreatedAt && cursorId ) {
        return prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
            SELECT  p.id, p.author_id, p.title, p.content, p.like_count, p.comment_count, p.created_at,
                    u.created_at, u.nickname AS author_nickname, u.avatar_url AS author_avatar_url
            FROM posts p 
            JOIN follows f ON f.follower_id = p.author_id AND f.follower_id = ${userId}
            JOIN users u ON u.id = p.author_id
            WHERE p.status = 'published'
            AND (p.created_at = ${cursorCreatedAt}
            OR (p.created_at = ${cursorCreatedAt} AND p.id < ${cursorId}))
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT ${limit + 1}
        `);
    }

    return prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        SELECT p.id, p.author_id, p.title, p.content, p.like_count, p.comment_count, p.created_at,
               u.nickname AS author_nickname, u.avatar_url AS author_avatar_url
        FROM posts p
        JOIN follows f ON f.followee_id = p.author_id AND f.follower_id = ${userId}
        JOIN users u ON u.id = p.author_id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT ${limit + 1}
    `);
}
