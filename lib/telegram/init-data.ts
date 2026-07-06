import { retrieveRawInitData } from '@telegram-apps/sdk'

// Telegram при повторном открытии Mini App иногда перезагружает webview с
// «голого» URL (без hash) и sessionStorage к тому моменту уже вытеснен —
// тогда retrieveRawInitData() возвращает пусто. В этом случае и имя падает на
// фолбэк «User», и API-запросы уходят без заголовка авторизации.
// Поэтому кешируем последний валидный initData в localStorage и подставляем
// его, когда «живого» нет.
const STORAGE_KEY = 'tg-init-data-raw'

function readLive(): string {
  try {
    return retrieveRawInitData() ?? ''
  } catch {
    return ''
  }
}

function readCached(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeCache(raw: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    // приватный режим / переполнение — молча игнорируем
  }
}

/** Сохраняет свежий initData, если он есть. Вызывать после init() SDK. */
export function persistInitData(): void {
  const live = readLive()
  if (live) writeCache(live)
}

/** Живой initData, а если его нет (перезагрузка webview) — последний сохранённый. */
export function resolveInitDataRaw(): string {
  const live = readLive()
  if (live) {
    writeCache(live)
    return live
  }
  return readCached()
}

export type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

/** Пользователь из resolved initData (живого или закешированного). */
export function resolveInitDataUser(): TelegramUser | null {
  const raw = resolveInitDataRaw()
  if (!raw) return null
  try {
    const userJson = new URLSearchParams(raw).get('user')
    return userJson ? (JSON.parse(userJson) as TelegramUser) : null
  } catch {
    return null
  }
}
