import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapExercise } from '@/lib/mappers'

export async function GET(req: NextRequest) {
  try {
    await getUserIdFromRequest(req)
    const exercises = await prisma.exercise.findMany({ orderBy: { createdAt: 'asc' } })
    return Response.json(exercises.map(mapExercise))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function POST(req: NextRequest) {
  try {
    await getUserIdFromRequest(req)
    const body = await req.json() as {
      name: string
      muscleGroup: string
      equipment: string
      videoUrl?: string
      description?: string
      imageUrl?: string
    }
    const exercise = await prisma.exercise.create({ data: body })
    return Response.json(mapExercise(exercise), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
