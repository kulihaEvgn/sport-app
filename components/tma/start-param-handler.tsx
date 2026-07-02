'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { retrieveLaunchParams, retrieveRawInitData } from '@telegram-apps/sdk'
import { SHARE_START_PREFIX } from '@/lib/share-link'

// Для startapp-ссылок Telegram кладёт параметр в launch params
// (tgWebAppStartParam) — это канонический источник. initData.start_param
// заполняется только для startattach, поэтому используем его лишь как fallback.
function readStartParam(): string {
  try {
    const lp = retrieveLaunchParams()
    const fromLp = lp.tgWebAppStartParam
    if (typeof fromLp === 'string' && fromLp) return fromLp
  } catch {
    /* ignore — попробуем initData ниже */
  }
  try {
    const raw = retrieveRawInitData() ?? ''
    return new URLSearchParams(raw).get('start_param') ?? ''
  } catch {
    return ''
  }
}

// Читает start_param на старте Mini App и, если это ссылка на расшаренную
// программу (share_<shareId>), ведёт получателя на превью. Запускается один раз.
export function StartParamHandler() {
  const router  = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const startParam = readStartParam()
    if (!startParam.startsWith(SHARE_START_PREFIX)) return
    const shareId = startParam.slice(SHARE_START_PREFIX.length)
    if (!shareId) return

    const target = `/share/${shareId}`
    if (window.location.pathname === target) return

    // Приложение стартует на '/', который серверно редиректит на '/workout'.
    // SPA-переход router.replace может быть проглочен этой гонкой (тогда нужен
    // был ручной reload). Пробуем мягкий переход, а если через 400мс мы всё
    // ещё не на нужной странице — делаем жёсткую навигацию (как тот reload).
    router.replace(target)
    const t = setTimeout(() => {
      if (window.location.pathname !== target) window.location.replace(target)
    }, 400)
    return () => clearTimeout(t)
  }, [router])

  return null
}
