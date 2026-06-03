import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapWorkoutLog } from '@/lib/mappers'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id } = await params
    const log = await prisma.workoutLog.findFirst({
      where: { id, userId },
      include: { sets: { orderBy: { setNumber: 'asc' } } },
    })
    if (!log) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(mapWorkoutLog(log))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
