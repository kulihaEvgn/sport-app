import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapTemplate, templateInclude } from '@/lib/mappers'

type Ctx = { params: Promise<{ id: string; templateId: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId, templateId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const { name } = await req.json() as { name: string }
    const template = await prisma.workoutTemplate.update({
      where: { id: templateId },
      data: { name },
      include: templateInclude,
    })
    return Response.json(mapTemplate(template))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId, templateId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const deleted = await prisma.workoutTemplate.delete({ where: { id: templateId } })

    // Re-index remaining templates and decrement cycleLength
    const remaining = await prisma.workoutTemplate.findMany({
      where: { programId },
      orderBy: { order: 'asc' },
    })

    await prisma.$transaction([
      ...remaining.map((t, i) =>
        prisma.workoutTemplate.update({ where: { id: t.id }, data: { order: i } }),
      ),
      prisma.program.update({ where: { id: programId }, data: { cycleLength: remaining.length } }),
    ])

    void deleted
    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
