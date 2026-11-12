import { prisma } from '../../common/db.ts';
import { AppError } from "../../common/errors.ts";

export async function createComment(
    postId: bigint,
    authorId: bigint,
    input: { content: string; parentId?: string }
) {
    const post = await prisma.post.findFirst({
        where: { id: postId, status: 'published' },
        select: { id: true, authorId: true },
    })
    if(!post) throw new AppError('POST_NOT_FOUND', 404, 'Post not found');

    let parentId: bigint | undefined;
    if(input.parentId) {
        parentId = BigInt(input.parentId);
        const parent = await prisma.post.findFirst({
            where: { id: parentId, postId, status: 'published' },
            select: { id: true }
        })
        if(!parent) throw new AppError('PARENT_COMMENT_NOT_FOUND', 404, 'Parent comment not found');
    }

    const comment = await prisma.$transaction(async tx => {
        const created = await tx.comment.create({
            data: { postId, authorId, content: input.content },
            include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
        })
        await tx.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } }
        })
        return created;
    })

    return {
        ...comment,
        id: comment.id.toString(),
        postId: comment.postId.toString(),
        authorId: comment.authorId.toString(),
        parentId: comment.parentId?.toString() ?? null,
        author: { ...comment.author, id: comment.author.id.toString() },
    }
}

export async function listComments(postId: bigint, limit = 50) {
    const rows = await prisma.comment.findMany({
        where: { postId, status: 'published' },
        orderBy: [{ createdAt: 'asc'}, { id: 'asc'}],
        take: limit,
        include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
    })

    return rows.map((comment) => ({
        ...comment,
        id: comment.id.toString(),
        postId: comment.postId.toString(),
        authorId: comment.authorId.toString(),
        parentId: comment.parentId?.toString() ?? null,
        author: { ...comment.author, id: comment.author.id.toString() },
    }))
}