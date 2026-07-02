import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const state = await prisma.userProgramState.upsert({
      where: { userId_programId: { userId, programId } },
      create: { userId, programId, currentDayIndex: 0 },
      update: {},
    })

    // Следующий день считаем от ФАКТИЧЕСКИ завершённого дня, а не от текущего
    // указателя: пользователь мог сделать любой день цикла (например, 7-й),
    // и тогда следующим должен стать день после него, а не «указатель + 1».
    const body = await req.json().catch(() => ({}))
    const completedDayIndex = typeof body?.completedDayIndex === 'number'
      ? body.completedDayIndex
      : state.currentDayIndex

    const next = program.cycleLength > 0
      ? (completedDayIndex + 1) % program.cycleLength
      : 0

    await prisma.userProgramState.update({
      where: { userId_programId: { userId, programId } },
      data: { currentDayIndex: next },
    })

    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
