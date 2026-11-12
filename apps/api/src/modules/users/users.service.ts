import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { enqueueOutbox } from "../../common/outbox.ts";

export async function follow(followerId: bigint, followeeId: bigint) {
    if (followerId === followeeId) throw new AppError('CANNOT_FOLLOW_SELF', 400, 'Cannot follow yourself');
    const target = await prisma.user.findUnique({ where: { id: followeeId } });
    if (!target || target.status !== 'active') throw new AppError('USER_NOT_FOUND', 404, 'User not found');

    return prisma.$transaction(async (tx) => {
        const result = await prisma.follow.createMany({
            data: [{ followerId, followeeId }],
            skipDuplicates: true,
        });

        if (result.count === 1) {
            await enqueueOutbox(tx, 'follow.created', {
                followerId: followeeId.toString(),
                followeeId: followeeId.toString(),
                actorId: followerId.toString(),
                recipientId: followeeId.toString(),
            })
        }
        return { created: result.count === 1 };
    });
}

export async function unfollow(followerId: bigint, followeeId: bigint) {
    const result = await prisma.follow.deleteMany({ where: { followerId, followeeId } });
    return { removed: result.count === 1 };
}