import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type InternalPost = {
    id: string;
    authorId: string;
    title: string | null;
    content: string;
    status: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    author: { id: string; nickname: string; email: string };
};

export type InternalUser = {
    id: string;
    email: string;
    nickname: string;
    status: string;
    createdAt: string;
    roles: string[];
};

export type InternalStats = {
    pendingPosts: number;
    publishedPosts: number;
    users: number;
    bannedUsers: number;
};

@Injectable()
export class ApiClient {
    private readonly base: string;
    private readonly token: string;

    constructor(config: ConfigService) {
        this.base = config.get<string>('API_INTERNAL_URL') ?? 'http://127.0.0.1:3000';
        this.token = config.get<string>('INTERNAL_API_TOKEN') ?? '';
    }

    private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.base}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Token': this.token,
                ...init.headers,
            },
            cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as
            | { message?: string }
            | T
            | null;

        if (!response.ok) {
            const message = (data as { message?: string } | null)?.message;
            throw new HttpException(message ?? `Internal API ${response.status}`, response.status);
        }

        return data as T;
    }

    listPosts(status = 'pending') {
        return this.request<{ items: InternalPost[] }>(
            `/internal/posts?status=${encodeURIComponent(status)}`,
        );
    }

    setPostStatus(id: string, status: 'published' | 'rejected' | 'pending') {
        return this.request<InternalPost>(`/internal/posts/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        });
    }

    listUsers() {
        return this.request<{ items: InternalUser[] }>('/internal/users');
    }

    setUserStatus(id: string, banned: boolean) {
        return this.request<{ id: string; status: string }>(
            `/internal/users/${id}/${banned ? 'ban' : 'unban'}`,
            { method: 'POST' },
        );
    }

    stats() {
        return this.request<InternalStats>('/internal/stats');
    }
}
