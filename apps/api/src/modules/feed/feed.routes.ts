import { Router } from "express";
import { requireAuth } from "../../common/auth.ts";
import { asyncHandler } from "../../common/middleware.ts";
import { parseBigIntId } from "../../common/params.ts";
import { findFollowingFeed } from "./feed.repository.ts";

export const feedRouter = Router();

feedRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 20),  50)
    const rows = await findFollowingFeed({ userId: parseBigIntId(req.user?.sub ), limit });
    res.json({
        items: rows.slice(0, limit).map((row) => ({
            ...row,
            id: String(row.id),
            author_id: String(row.author_id),
        })),
        nextCursor: rows.length > limit ? String(rows[limit - 1]?.created_at) : null,
    });
}));
