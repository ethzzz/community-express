import { Router } from 'express';
import { requireAuth } from "../../common/auth.ts";
import { asyncHandler } from "../../common/middleware.ts";
import { parseBigIntId } from "../../common/params.ts";
import { likePost, unlikePost } from "./likes.service.ts";

export const likesRouter = Router({ mergeParams: true });
likesRouter.use(requireAuth)

likesRouter.post('/', asyncHandler(async (req, res) => {
    res.json(await likePost(parseBigIntId(req.params.postId, 'postId'), BigInt(req.user!.sub)))
}))

likesRouter.delete('/', asyncHandler(async (req, res) => {
    res.json(await unlikePost(parseBigIntId(req.params.postId), BigInt(req.user!.sub)))
}))