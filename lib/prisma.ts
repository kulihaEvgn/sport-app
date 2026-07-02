import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Neon serverless driver (WebSocket) вместо дефолтного TCP-драйвера Prisma.
// Причина: Neon усыпляет compute через 5 мин простоя, а TCP-подключение Prisma
// проигрывает гонку по таймауту на холодном старте базы (P1001). WebSocket-драйвер
// Neon штатно переживает cold start.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

// Singleton — переиспользуется между warm serverless invocations и в dev hot-reload.
// В проде Vercel сохраняет global между warm invocations, что экономит cold-start init Prisma.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
globalForPrisma.prisma = prisma
