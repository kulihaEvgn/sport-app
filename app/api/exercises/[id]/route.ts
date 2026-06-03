import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapExercise } from '@/lib/mappers'
import type { MuscleGroup } from '@/types'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await getUserIdFromRequest(req)
    const { id } = await params
    const exercise = await prisma.exercise.findUnique({ where: { id } })
    if (!exercise) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(mapExercise(exercise))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await getUserIdFromRequest(req)
    const { id } = await params
    const body = await req.json() as Partial<{
      name: string
      muscleGroup: MuscleGroup
      equipment: string
      videoUrl: string
      description: string
      imageUrl: string
    }>
    const exercise = await prisma.exercise.update({ where: { id }, data: body })
    return Response.json(mapExercise(exercise))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    await getUserIdFromRequest(req)
    const { id } = await params
    await prisma.exercise.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
