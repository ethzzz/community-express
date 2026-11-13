import type { Express } from 'express'
import request from 'supertest'
import { prisma } from '../src/common/db.ts'

export async function resetDb() {
    await prisma.$transaction([
        prisma.notification.deleteMany(),
        prisma.outboxEvent.deleteMany(),
        prisma.like.deleteMany(),
        prisma.comment.deleteMany(),
        prisma.follow.deleteMany(),
        prisma.refreshToken.deleteMany(),
        prisma.userRole.deleteMany(),
        prisma.post.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}

export async function seedRoles() {
    const permissions = [
        { code: 'admin:access', name: '访问后台' },
        { code: 'post:review', name: '审核帖子' },
        { code: 'report:handle', name: '处理举报' },
        { code: 'user:ban', name: '封禁用户' },
    ]
    for (const item of permissions) {
        await prisma.permission.upsert({
            where: { code: item.code },
            update: { name: item.name },
            create: item,
        });
    }

    const userRole = await prisma.role.upsert({
        where: { code: 'user' },
        update: {},
        create: { code: 'user', name: '普通用户' },
    });
    const adminRole = await prisma.role.upsert({
        where: { code: 'admin' },
        update: {},
        create: { code: 'admin', name: '管理员' },
    });

    for (const permission of await prisma.permission.findMany()) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id },
            },
            update: {},
            create: { roleId: adminRole.id, permissionId: permission.id },
        });
    }

    return { userRole, adminRole };
}

// 注册并登录，返回可直接放进 Authorization 的 token
export async function registerAndLogin(
    app: Express,
    email = `user-${Date.now()}@test.com`,
) {
    const password = 'Passw0rd!';
    const register = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password, nickname: 'Test' });
    if (register.status !== 201) {
        throw new Error(`register failed: ${register.status} ${JSON.stringify(register.body)}`);
    }

    const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
    if (login.status !== 200) {
        throw new Error(`login failed: ${login.status} ${JSON.stringify(login.body)}`);
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    return { token: login.body.accessToken as string, userId: user.id, email, password };
}