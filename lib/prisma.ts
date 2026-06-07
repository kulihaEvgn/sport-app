import { PrismaClient } from '@prisma/client'

// Singleton — переиспользуется между warm serverless invocations и в dev hot-reload.
// В проде Vercel сохраняет global между warm invocations, что экономит cold-start init Prisma.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()
globalForPrisma.prisma = prisma
