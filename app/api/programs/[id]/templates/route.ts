import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapTemplate, templateInclude } from '@/lib/mappers'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const { name } = await req.json() as { name: string }

    const order = await prisma.workoutTemplate.count({ where: { programId } })

    const template = await prisma.$transaction(async tx => {
      const t = await tx.workoutTemplate.create({
        data: { programId, order, name },
        include: templateInclude,
      })
      await tx.program.update({ where: { id: programId }, data: { cycleLength: { increment: 1 } } })
      return t
    })

    return Response.json(mapTemplate(template), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
