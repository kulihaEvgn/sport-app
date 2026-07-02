// Ссылка на расшаренную программу.
//
// Внутри Telegram нужен deep link вида
//   https://t.me/<bot>/<app>?startapp=share_<shareId>
// — он открывает Mini App в контейнере Telegram (с initData), а не как
// внешний сайт. На старте приложение читает start_param (см.
// components/tma/start-param-handler.tsx) и ведёт получателя на превью.
//
// Требуется настроенный Direct Link Mini App в BotFather (/newapp) и env:
//   NEXT_PUBLIC_BOT_USERNAME — username бота без @
//   NEXT_PUBLIC_MINIAPP_NAME — short name Mini App (Direct Link)
// Если они не заданы — падаем на обычный web-URL (работает как раньше).

export const SHARE_START_PREFIX = 'share_'

export function buildShareStartParam(shareId: string): string {
  return `${SHARE_START_PREFIX}${shareId}`
}

// Username бота по умолчанию. Не секрет — он и так виден в самой ссылке.
// Можно переопределить через NEXT_PUBLIC_BOT_USERNAME (напр. для staging-бота).
const DEFAULT_BOT_USERNAME = 'envhSportAppBot'

/** Deep link на Mini App, если задан username бота; иначе null. */
export function buildShareDeepLink(shareId: string): string | null {
  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME || DEFAULT_BOT_USERNAME
  if (!bot) return null
  // Без short name открываем основной Mini App бота: t.me/<bot>?startapp=...
  // С short name — named Direct Link: t.me/<bot>/<app>?startapp=...
  const app  = process.env.NEXT_PUBLIC_MINIAPP_NAME
  const base = app ? `https://t.me/${bot}/${app}` : `https://t.me/${bot}`
  return `${base}?startapp=${buildShareStartParam(shareId)}`
}

/** Ссылка для шаринга: deep link при наличии env, иначе web-fallback. */
export function buildShareLink(shareId: string, origin: string): string {
  return buildShareDeepLink(shareId) ?? `${origin}/share/${shareId}`
}
