import { type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Public — no auth. Returns a slim preview of a shared program.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params

  const program = await prisma.program.findUnique({
    where: { shareId },
    include: {
      templates: {
        orderBy: { order: 'asc' },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
            include: { exercise: true },
          },
        },
      },
    },
  })

  if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

  // Slim down what we expose publicly — no userId, no ids of internal rows.
  return Response.json({
    shareId:     program.shareId!,
    name:        program.name,
    description: program.description ?? undefined,
    daysPerWeek: program.daysPerWeek,
    cycleLength: program.cycleLength,
    createdAt:   program.createdAt,
    templates: program.templates.map(t => ({
      name: t.name,
      exercises: t.exercises.map(te => ({
        exerciseName: te.exercise.name,
        muscleGroup:  te.exercise.muscleGroup,
        targetSets:   te.targetSets,
        targetVolume: te.targetVolume,
      })),
    })),
  })
}
