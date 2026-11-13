import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const registry = new OpenAPIRegistry();

registry.registerPath({
    method: 'get',
    path: '/api/v1/feed',
    summary: '关注流',
    request: {
        query: z.object({
            limit: z.coerce.number().int().min(1).max(50).default(20),
            cursor: z.string().optional()
        }),
    },
    responses: {
        200: { description: 'feed page' },
        401: { description: 'unauthorized' },
    }
})

export function buildOpenApiDocument() {
    return new OpenApiGeneratorV3(registry.definitions).generateDocument({
        openapi: '3.0.0',
        info: { title: 'Community API', version: '1.0.0' },
    })
}