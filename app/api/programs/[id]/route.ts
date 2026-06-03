import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapProgram, programInclude } from '@/lib/mappers'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id } = await params
    const program = await prisma.program.findFirst({
      where: { id, userId },
      include: programInclude,
    })
    if (!program) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(mapProgram(program))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id } = await params
    const body = await req.json() as Partial<{ name: string; description: string; daysPerWeek: number }>
    const program = await prisma.program.update({
      where: { id, userId },
      data: body,
      include: programInclude,
    })
    return Response.json(mapProgram(program))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id } = await params
    await prisma.program.delete({ where: { id, userId } })
    return new Response(null, { status: 204 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
