import { prisma } from '../../common/db.ts';
import { AppError } from '../../common/errors.ts';

export async function likePost(postId: bigint, userId: bigint) {
    return prisma.$transaction(async (tx) => {
        const post = await tx.post.findFirst({
            where: { id: postId, status: 'published' },
            select: { id: true, authorId: true }
        })
        if(!post) throw new AppError("POST_NOT_FOUND", 404, `Post not found`);

        const created = await tx.like.createMany({
            data: [{ userId, targetType: 'post', targetId: postId }],
            skipDuplicates: true
        })

        if(created.count === 1) {
            await tx.post.update({
                where: { id: postId },
                data: { likeCount: { increment: 1 }}
            })
        }

        return { like: true, changed: created.count === 1, authorId: post.authorId }
    })
}

export async function unlikePost(postId: bigint, userId: bigint) {
    return prisma.$transaction(async (tx) => {
        const post = await tx.post.findFirst({
            where: { id: postId, status: 'published' },
            select: { id: true }
        })
        if(!post) throw new AppError("POST_NOT_FOUND", 404, `Post not found`);

        const deleted = await tx.like.deleteMany({
            where: { userId, targetType: 'post', targetId: postId },
        })

        if(deleted.count === 1) {
            await tx.post.updateMany({
                where: { id: postId, likeCount: { gt: 0 } },
                data: { likeCount: { decrement: 1 }}
            })
        }

        return { like: false, changed: deleted.count === 1 }
    })
}

