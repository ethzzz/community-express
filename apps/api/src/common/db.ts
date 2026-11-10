import { PrismaClient } from "@prisma/client";
import { config } from './config.ts'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient}

