import { Router } from "express";
import { optionalAuth, requireAuth } from "../../common/auth.ts";
import { asyncHandler } from "../../common/middleware.ts";
import { parseBigIntId } from "../../common/params.ts";
import { createPost, getPost, listPublishedPosts } from "./posts.service.ts";

export const postsRouter = Router();

const userId = (req: { user?: { sub: string }}) => BigInt(req.user!.sub);

postsRouter.get('/', asyncHandler(async (req, res) => {
    res.json({ items: await listPublishedPosts() });
}))

postsRouter.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
    res.json(await getPost(parseBigIntId(req.params.id), req.user ? userId(req) : undefined));
}))

postsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
    res.status(201).json(await createPost(userId(req), req.body));
}))