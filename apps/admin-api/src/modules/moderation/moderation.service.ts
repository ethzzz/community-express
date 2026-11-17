import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ApiClient } from '../../clients/api-client.js';
import { parseId } from '../../common/parse-id.js';

@Injectable()
export class ModerationService {
    constructor(
        private readonly api: ApiClient,
        private readonly prisma: PrismaClient,
    ) {}

    list(status = 'pending') {
        return this.api.listPosts(status);
    }

    async approve(postId: string, operatorId: bigint) {
        await this.api.setPostStatus(postId, 'published');
        await this.prisma.moderationRecord.create({
            data: {
                targetType: 'post',
                targetId: parseId(postId, 'postId'),
                action: 'approve',
                operatorId,
            },
        });
        return { ok: true };
    }

    async reject(postId: string, operatorId: bigint, reason?: string) {
        await this.api.setPostStatus(postId, 'rejected');
        await this.prisma.moderationRecord.create({
            data: {
                targetType: 'post',
                targetId: parseId(postId, 'postId'),
                action: 'reject',
                operatorId,
                reason: reason ?? null,
            },
        });
        return { ok: true };
    }
}
