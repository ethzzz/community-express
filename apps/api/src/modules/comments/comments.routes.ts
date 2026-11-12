import { Router } from "express";
import { requireAuth } from "../../common/auth.ts";
import { asyncHandler } from "../../common/middleware.ts";
import { parseBigIntId } from "../../common/params.ts";
import { createComment, listComments } from "./comments.services.ts";

export const commentsRouter = Router({ mergeParams: true });

commentsRouter.get('/', asyncHandler(async (req, res) => {
    res.json({ items: await listComments(parseBigIntId(req.params.postId, 'postId'))})
}))

commentsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
    res.status(201).json(
        await createComment(parseBigIntId(req.params.postId, 'postId'), BigInt(req.user!.sub), req.body)
    )
}))