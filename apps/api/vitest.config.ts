import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        fileParallelism: false,
        env: {
            NODE_ENV: 'test',
            DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'mysql://root:123456@127.0.0.1:3306/community_test',
        }
    }
})