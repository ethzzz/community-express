import { config } from './config.ts';

export type IndexedPost = {
    id: string;
    title: string | null;
    content: string;
    authorId: string;
    createdAt: string;
};

function headers() {
    return {
        'Content-Type': 'application/json',
        ...(config.MEILI_KEY ? { Authorization: `Bearer ${config.MEILI_KEY}` } : {}),
    };
}

export async function indexPosts(posts: IndexedPost[]) {
    if (!config.MEILI_HOST || posts.length === 0) return false;

    const response = await fetch(`${config.MEILI_HOST}/indexes/posts/documents`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(posts),
    });
    if (!response.ok) throw new Error(`Meilisearch index failed: ${response.status}`);
    return true;
}

export async function searchPosts(query: string, limit: number) {
    if (!config.MEILI_HOST) return null;

    const response = await fetch(`${config.MEILI_HOST}/indexes/posts/search`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ q: query, limit }),
    }).catch(() => null);

    if (!response?.ok) return null;

    const data = (await response.json()) as { hits?: IndexedPost[] };
    return data.hits ?? [];
}
