import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapTemplateExercise } from '@/lib/mappers'
import type { TargetVolume } from '@/types'

type Ctx = { params: Promise<{ id: string; templateId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId, templateId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json() as {
      exerciseId: string
      targetSets: number
      targetVolume: TargetVolume
      restSeconds: number
      plannedWeight?: number
    }

    const order = await prisma.workoutTemplateExercise.count({ where: { templateId } })

    const te = await prisma.workoutTemplateExercise.create({
      data: { ...body, templateId, order: order + 1 },
      include: { exercise: true },
    })

    return Response.json(mapTemplateExercise(te), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
