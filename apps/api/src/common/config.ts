import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_TTL_DAYS : z.coerce.number().int().positive().default(7),
    WEB_ORIGIN: z.url(),
    INTERNAL_API_TOKEN: z.string().min(16),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    MEILI_HOST: z.url().optional(),
    MEILI_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.url().default('https://api.openai.com/v1'),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),
});

const parsed = envSchema.safeParse(process.env);

if(!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.issues);
    process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;