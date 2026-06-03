import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string; templateId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id: programId, templateId } = await params

    const program = await prisma.program.findFirst({ where: { id: programId, userId } })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })

    const { orderedIds } = await req.json() as { orderedIds: string[] }

    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.workoutTemplateExercise.update({
          where: { id, templateId },
          data: { order: i + 1 },
        }),
      ),
    )

    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
