import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapTemplateExercise } from '@/lib/mappers'
import type { TargetVolume } from '@/types'

type Ctx = { params: Promise<{ id: string; templateId: string; teId: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId, templateId, teId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json() as Partial<{
      targetSets: number
      targetVolume: TargetVolume
      restSeconds: number
      plannedWeight: number
    }>

    const te = await prisma.workoutTemplateExercise.update({
      where: { id: teId, templateId },
      data: body,
      include: { exercise: true },
    })

    return Response.json(mapTemplateExercise(te))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId, templateId, teId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    await prisma.workoutTemplateExercise.delete({ where: { id: teId, templateId } })

    // Re-index remaining exercises
    const remaining = await prisma.workoutTemplateExercise.findMany({
      where: { templateId },
      orderBy: { order: 'asc' },
    })
    await prisma.$transaction(
      remaining.map((e, i) =>
        prisma.workoutTemplateExercise.update({ where: { id: e.id }, data: { order: i + 1 } }),
      ),
    )

    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
