import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { parseBigIntId } from "../../common/params.ts";
import { follow, unfollow } from './users.service.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.post('/:id/follow', asyncHandler(async (req, res) => {
    res.json(await follow(BigInt(req.user!.sub), parseBigIntId(req.params.id ?? '')));
}));

usersRouter.delete('/:id/follow', asyncHandler(async (req, res) => {
    res.json(await unfollow(BigInt(req.user!.sub), parseBigIntId(req.params.id ?? '')));
}));