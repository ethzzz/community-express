import argon2 from "argon2";
import { config } from '../../common/config.ts';
import { prisma } from "../../common/db.ts";
import { AppError } from "../../common/errors.ts";
import { createRefreshToken, hashToken, signAccessToken } from "./token.service.ts";

const refreshExpiresAt = () => new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 86_400_400);

export async function register(input: { email: string; password: string; nickname: string }) {
    const email = input.email.trim().toLowerCase();
    if(await prisma.user.findUnique({ where: { email }})) {
        throw new AppError('EMAIL_TAKEN', 409, 'Email is already registered.');
    }

    const passwordHash = await argon2.hash(input.password);
    const role = await prisma.role.findUnique({ where: { code: 'user'}});
    if(!role) throw new AppError('ROLE_NOT_INITIALIZED', 500, 'Run seed first');

    const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({ data: { email, passwordHash, nickname: input.nickname.trim() } });
        await tx.userRole.create({ data: { userId: created.id, roleId: role.id }});
        return created;
    })

    return { id: user.id.toString(), email: user.email, nickname: user.nickname  };
}

export async function login(input: { email: string; password: string; userAgent?: string; ip?: string }) {
    const user = await prisma.user.findUnique({
        where: { email: input.email.trim().toLowerCase() },
        include: { roles: { include: { role: true }}},
    });
    if(!user || !(await argon2.verify(user.passwordHash, input.password))) {
        throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect.');
    }
    if(user.status !== 'active') throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');

    const refresh = createRefreshToken();
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: refresh.tokenHash,
            expiresAt: refreshExpiresAt(),
            userAgent: input.userAgent ?? '',
            ip: input.ip ?? ''
        }
    })

    return {
        accessToken: signAccessToken({
            sub: user.id.toString(),
            roles: user.roles.map((item) => item.role.code),
        }),
        refreshToken: refresh.token,
        user: { id: user.id.toString(), email: user.email, nickname: user.nickname }
    }
}

export async function refresh(input: { refreshToken: string }) {
    const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash: hashToken(input.refreshToken) },
    });
    if (!stored) throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token invalid');
    if (stored.revokedAt) {
        await prisma.refreshToken.updateMany({
            where: { userId: stored.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        throw new AppError('REFRESH_TOKEN_REUSED', 401, 'Refresh token reuse detected');
    }
    if (stored.expiresAt <= new Date()) throw new AppError('REFRESH_TOKEN_EXPIRED', 401, 'Refresh token expired');

    const user = await prisma.user.findUnique({
        where: { id: stored.userId },
        include: { roles: { include: { role: true } } },
    });
    if (!user || user.status !== 'active') throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');

    const next = createRefreshToken();
    await prisma.$transaction([
        prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
        prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: next.tokenHash,
                expiresAt: refreshExpiresAt(),
                userAgent: stored.userAgent,
                ip: stored.ip,
            },
        }),
    ]);

    return {
        accessToken: signAccessToken({
            sub: user.id.toString(),
            roles: user.roles.map((item) => item.role.code),
        }),
        refreshToken: next.token,
    };
}

export async function logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
    });
}