import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapProgram, programInclude } from '@/lib/mappers'

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    const programs = await prisma.program.findMany({
      where: { userId },
      include: programInclude,
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(programs.map(mapProgram))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    const body = await req.json() as {
      name: string
      description?: string
      daysPerWeek: number
    }
    const program = await prisma.program.create({
      data: { ...body, userId, cycleLength: 0, isActive: false },
      include: programInclude,
    })
    return Response.json(mapProgram(program), { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
