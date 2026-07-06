import { type NextRequest } from 'next/server'
import { validate } from '@telegram-apps/init-data-node'
import { prisma } from './prisma'

export class AuthError extends Error {}

// In-memory cache живёт в пределах одного serverless invocation (warm container).
// Сохраняет нас от лишнего upsert в БД на каждый запрос — если юзера уже видели,
// не дёргаем БД повторно. Cold start invocation начнёт с пустого кеша — это норм.
const seenUsers = new Set<string>()

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
      // expiresIn: 0 — не проверяем возраст initData. Подлинность гарантирует
      // HMAC-подпись (её не подделать без токена бота). Telegram при повторном
      // открытии Mini App переиспользует старый initData со старым auth_date;
      // жёсткий TTL отбрасывал бы его после паузы в несколько дней → 401 и
      // «данные не приходят». Подпись бессрочна, поэтому это безопасно.
      validate(initDataRaw, botToken, { expiresIn: 0 })
    } catch {
      throw new AuthError('Invalid initData signature')
    }
  }

  if (!seenUsers.has(userId)) {
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
    seenUsers.add(userId)
  }

  return userId
}

export function authError(message: string, status = 401) {
  return Response.json({ error: message }, { status })
}
