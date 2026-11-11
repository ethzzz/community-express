import { PrismaClient } from "@prisma/client";
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    for(const item of [
        { code: 'admin:access', name: '访问后台'},
        { code: 'post:review', name: '审核帖子'},
        { code: 'report:handle', name: '处理举报'},
        { code: 'user:ban', name: '封禁用户'},
    ]) {
        await prisma.permission.upsert({
            where: { code: item.code },
            update: { name: item.name },
            create: item
        })
    }

    const adminRole = await prisma.role.upsert({
        where: { code: 'admin' },
        update: { name: '管理员' },
        create: { code: 'admin', name: '管理员' },
    })

    const userRole = await prisma.role.upsert({
        where: { code: 'user' },
        update: { name: '普通用户' },
        create: { code: 'user', name: '普通用户' },
    })

    for (const permission of await prisma.permission.findMany()) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
            update: {},
            create: { roleId: adminRole.id, permissionId: permission.id },
        })
    }

    const passwordHash = await argon2.hash('Admin123!ChangeMe');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: { passwordHash },
        create: { email: 'admin@test.com', passwordHash, nickname: 'Admin' },
    })

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
        update: {},
        create: { userId: admin.id, roleId: adminRole.id },
    })

    const user = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: { passwordHash },
        create: { email: 'user@test.com', passwordHash, nickname: 'User' },
    })

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: userRole.id } },
        update: {},
        create: { userId: user.id, roleId: userRole.id },
    })

    console.log('Seed done')
}

main()
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
    .finally(()=> {
        prisma.$disconnect();
    })