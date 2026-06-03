import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapWorkoutLog } from '@/lib/mappers'
import type { WorkoutLog } from '@/types'

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
    const body = await req.json() as WorkoutLog

    // Upsert: save or update the log (supports in-progress and completed)
    const log = await prisma.workoutLog.upsert({
      where: { id: body.id },
      create: {
        id: body.id,
        userId,
        programId: body.programId,
        workoutTemplateId: body.workoutTemplateId,
        dayIndex: body.dayIndex,
        startedAt: new Date(body.startedAt),
        finishedAt: body.finishedAt ? new Date(body.finishedAt) : null,
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
              completedAt: new Date(s.completedAt),
            })),
            skipDuplicates: true,
          },
        },
      },
      update: {
        finishedAt: body.finishedAt ? new Date(body.finishedAt) : null,
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
              completedAt: new Date(s.completedAt),
            },
            update: {
              weight: s.weight,
              reps: s.reps,
              completedAt: new Date(s.completedAt),
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
