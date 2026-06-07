import { type NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { getUserIdFromRequest, AuthError, authError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function generateShareId() {
  return randomBytes(8).toString('hex') // 16 chars, ~10^19 combinations
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(req)
    const { id } = await params

    const program = await prisma.program.findUnique({ where: { id }, select: { userId: true, shareId: true } })
    if (!program)               return Response.json({ error: 'Not found' }, { status: 404 })
    if (program.userId !== userId) return authError('Forbidden', 403)

    let shareId = program.shareId
    if (!shareId) {
      shareId = generateShareId()
      await prisma.program.update({ where: { id }, data: { shareId } })
    }

    const proto = req.headers.get('x-forwarded-proto') ?? 'https'
    const host  = req.headers.get('host') ?? 'localhost:3100'
    const url   = `${proto}://${host}/share/${shareId}`

    return Response.json({ shareId, url })
  } catch (e) {
    if (e instanceof AuthError) return authError(e.message)
    throw e
  }
}
