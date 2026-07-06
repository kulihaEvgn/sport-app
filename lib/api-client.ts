import { resolveInitDataRaw } from '@/lib/telegram/init-data'

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { skipAuth, ...fetchOptions } = options ?? {}
  const authHeaders: Record<string, string> = skipAuth
    ? {}
    : { 'X-Telegram-Init-Data': resolveInitDataRaw() }

  const res = await fetch(path, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(fetchOptions.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }

  const text = (await res.text()).trim()
  if (!text) return undefined as T
  return JSON.parse(text, dateReviver) as T
}

// Converts ISO-8601 date strings back to Date objects after JSON.parse
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_RE.test(value)) return new Date(value)
  return value
}
