import { type NextRequest } from 'next/server'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapUser } from '@/lib/mappers'

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return authError('User not found', 404)
    return Response.json(mapUser(user))
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
