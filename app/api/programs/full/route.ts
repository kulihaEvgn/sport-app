import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapProgram, programInclude } from '@/lib/mappers'
import type { TargetVolume } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    const body = await req.json() as {
      name: string
      description?: string
      daysPerWeek: number
      templates: Array<{
        name: string
        exercises: Array<{
          exerciseId: string
          targetSets: number
          targetVolume: TargetVolume
          restSeconds: number
          plannedWeight?: number
        }>
      }>
    }

    const program = await prisma.program.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
        daysPerWeek: body.daysPerWeek,
        cycleLength: body.templates.length,
        isActive: false,
        templates: {
          create: body.templates.map((t, dayIdx) => ({
            order: dayIdx,
            name: t.name,
            exercises: {
              create: t.exercises.map((e, exIdx) => ({
                exerciseId: e.exerciseId,
                order: exIdx + 1,
                targetSets: e.targetSets,
                targetVolume: e.targetVolume,
                restSeconds: e.restSeconds,
                plannedWeight: e.plannedWeight,
              })),
            },
          })),
        },
      },
      include: programInclude,
    })

    return Response.json(mapProgram(program), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
