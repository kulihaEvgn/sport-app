import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapProgram, programInclude } from '@/lib/mappers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { shareId } = await params

    const source = await prisma.program.findUnique({
      where: { shareId },
      include: {
        templates: {
          orderBy: { order: 'asc' },
          include: { exercises: { orderBy: { order: 'asc' } } },
        },
      },
    })
    if (!source) return Response.json({ error: 'Not found' }, { status: 404 })

    // Snapshot copy: new Program + new templates + new template-exercises pointing
    // to the same global Exercise rows. shareId is NOT copied — the new owner can
    // share their own copy separately if they want.
    const created = await prisma.program.create({
      data: {
        userId,
        name:        source.name,
        description: source.description,
        daysPerWeek: source.daysPerWeek,
        cycleLength: source.cycleLength,
        isActive:    false,
        templates: {
          create: source.templates.map(t => ({
            order: t.order,
            name:  t.name,
            exercises: {
              create: t.exercises.map(te => ({
                exercise:      { connect: { id: te.exerciseId } },
                order:         te.order,
                targetSets:    te.targetSets,
                targetVolume:  te.targetVolume ?? {},
                restSeconds:   te.restSeconds,
                plannedWeight: te.plannedWeight,
              })),
            },
          })),
        },
      },
    })

    const full = await prisma.program.findUnique({
      where:   { id: created.id },
      include: programInclude,
    })
    if (!full) return Response.json({ error: 'Failed to create' }, { status: 500 })

    return Response.json(mapProgram(full), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
