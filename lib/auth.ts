import { type NextRequest } from 'next/server'
import { validate } from '@telegram-apps/init-data-node'
import { prisma } from './prisma'

export class AuthError extends Error {}

export async function getUserIdFromRequest(req: NextRequest): Promise<string> {
  const initDataRaw = req.headers.get('x-telegram-init-data') ?? ''

  if (!initDataRaw) throw new AuthError('Missing X-Telegram-Init-Data')

  const params = new URLSearchParams(initDataRaw)
  const userJson = params.get('user')
  if (!userJson) throw new AuthError('Missing user in initData')

  const tgUser = JSON.parse(userJson) as {
    id: number
    first_name?: string
    username?: string
  }
  const userId = String(tgUser.id)

  if (process.env.NODE_ENV === 'production') {
    const botToken = process.env.BOT_TOKEN
    if (!botToken) throw new AuthError('BOT_TOKEN not set')
    try {
      validate(initDataRaw, botToken, { expiresIn: 86400 })
    } catch {
      throw new AuthError('Invalid initData signature')
    }
  }

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      firstName: tgUser.first_name ?? 'User',
      username: tgUser.username ?? null,
    },
    update: {
      firstName: tgUser.first_name ?? 'User',
      username: tgUser.username ?? null,
    },
  })

  return userId
}

export function authError(message: string, status = 401) {
  return Response.json({ error: message }, { status })
}
