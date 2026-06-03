import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapUserProgramState } from '@/lib/mappers'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId } = await params

    const state = await prisma.userProgramState.findUnique({
      where: { userId_programId: { userId, programId } },
    })

    if (!state) {
      // Auto-create state on first access
      const created = await prisma.userProgramState.create({
        data: { userId, programId, currentDayIndex: 0 },
      })
      return Response.json(mapUserProgramState(created))
    }

    return Response.json(mapUserProgramState(state))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
