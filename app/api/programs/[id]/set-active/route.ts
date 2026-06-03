import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id } = await params

    await prisma.$transaction([
      prisma.program.updateMany({ where: { userId, isActive: true }, data: { isActive: false } }),
      prisma.program.update({ where: { id, userId }, data: { isActive: true } }),
    ])

    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
