import request from 'supertest';
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from '../src/app.ts'
import { prisma } from "../src/common/db.ts";

const app = createApp();

describe('likes', () => {
    beforeEach((async () => {
        await prisma.like.deleteMany();
        await prisma.post.deleteMany();
    }))

    async function registerAndLogin(email: string) {
        await request(app)
            .post('/api/v1/auth/register')
            .send({ email, password: 'Passw0rd!', nickname: 'L'});
        const login = await request(app)
            .post('/api/v1/auth/login')
            .send({ email, password: 'Passw0rd!',});
        const user = await prisma.user.findUniqueOrThrow({ where: { email}});
        return { token: login.body.accessToken as string, userId: user.id };
    }

    it('is idempotent', async () => {
        const { token, userId } = await registerAndLogin(`like-${Date.now()}@test.com`)
        const post = await prisma.post.create({
            data: { authorId: userId, content: 'hello', status: 'published' },
        })
        const first = await request(app)
            .post(`/api/v1/posts/${post.id}/like`)
            .set('Authorization', `Bearer ${token}`);
        const second = await request(app)
            .post(`/api/v1/posts/${post.id}/like`)
            .set('Authorization', `Bearer ${token}`);
        expect(first.body.changed).toBe(true);
        expect(second.body.changed).toBe(false);
        const updated = await prisma.post.findUniqueOrThrow({ where: { id: post.id } });
        expect(updated.likeCount).toBe(1);
    })
})