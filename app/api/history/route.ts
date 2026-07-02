import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapWorkoutLog } from '@/lib/mappers'
import { workoutLogInputSchema } from '@/schemas/workout-log'

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      include: { sets: { orderBy: { setNumber: 'asc' } } },
      orderBy: { startedAt: 'desc' },
    })
    return Response.json(logs.map(mapWorkoutLog))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)

    const parsed = workoutLogInputSchema.safeParse(await req.json())
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 },
      )
    }
    const body = parsed.data

    // IDOR guard: если лог с таким id уже существует и принадлежит другому
    // юзеру — запрещаем перезапись. userId берётся только из initData, не из тела.
    const existing = await prisma.workoutLog.findUnique({
      where: { id: body.id },
      select: { userId: true },
    })
    if (existing && existing.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Upsert: save or update the log (supports in-progress and completed)
    const log = await prisma.workoutLog.upsert({
      where: { id: body.id },
      create: {
        id: body.id,
        userId,
        programId: body.programId,
        workoutTemplateId: body.workoutTemplateId,
        dayIndex: body.dayIndex,
        startedAt: body.startedAt,
        finishedAt: body.finishedAt ?? null,
        isCompleted: body.isCompleted,
        sets: {
          createMany: {
            data: body.sets.map(s => ({
              id: s.id,
              exerciseId: s.exerciseId,
              templateExerciseId: s.templateExerciseId,
              setNumber: s.setNumber,
              weight: s.weight,
              reps: s.reps,
              completedAt: s.completedAt,
            })),
            skipDuplicates: true,
          },
        },
      },
      update: {
        finishedAt: body.finishedAt ?? null,
        isCompleted: body.isCompleted,
        sets: {
          upsert: body.sets.map(s => ({
            where: { id: s.id },
            create: {
              id: s.id,
              exerciseId: s.exerciseId,
              templateExerciseId: s.templateExerciseId,
              setNumber: s.setNumber,
              weight: s.weight,
              reps: s.reps,
              completedAt: s.completedAt,
            },
            update: {
              weight: s.weight,
              reps: s.reps,
              completedAt: s.completedAt,
            },
          })),
        },
      },
      include: { sets: { orderBy: { setNumber: 'asc' } } },
    })

    return Response.json(mapWorkoutLog(log), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
