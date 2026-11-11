import type { Prisma } from "@prisma/client";
import {prisma} from "../../common/db.ts";
import {AppError} from "../../common/errors.ts";


const select = {
    id: true, authorId: true,  title: true, content: true,
    status: true, likeCount: true, commentCount: true, createdAt: true,
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof select }>

const toPost = (post: PostRow) => ({
    ...post,
    id: post.id.toString(),
    authorId: post.authorId.toString()
})

export async function createPost(authorId: bigint, input: { title?: string; content: string }) {
    const post = await prisma.post.create({
        data: { authorId, title: input.title ?? null, content: input.content, status: 'pending' },
        select
    });
    return toPost(post);
}

export async function listPublishedPosts() {
    const rows = await prisma.post.findMany({
        where: { status: 'published' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 20,
        select,
    })
    return rows.map(toPost);
}

export async function getPost(id: bigint, viewerId?: bigint) {
    const post = await prisma.post.findFirst({
        where: { id, status: { not : 'deleted' }},
        select
    })
    if(!post) throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
    if(post.status !== 'published' && post.authorId !== viewerId) {
        throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
    }
    return toPost(post);
}