import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ApiClient } from '../../clients/api-client.js';
import { parseId } from '../../common/parse-id.js';

@Injectable()
export class AdminUsersService {
    constructor(
        private readonly api: ApiClient,
        private readonly prisma: PrismaClient,
    ) {}

    list() {
        return this.api.listUsers();
    }

    async setStatus(id: string, banned: boolean, operatorId: bigint) {
        const result = await this.api.setUserStatus(id, banned);
        await this.prisma.moderationRecord.create({
            data: {
                targetType: 'user',
                targetId: parseId(id, 'userId'),
                action: banned ? 'ban' : 'unban',
                operatorId,
            },
        });
        return result;
    }
}
