import { PrismaClient } from "@prisma/client";
import { config } from './config.ts'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasourceUrl: config.DATABASE_URL,
        log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });

if(config.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

