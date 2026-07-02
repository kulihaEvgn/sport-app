'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { retrieveLaunchParams, retrieveRawInitData } from '@telegram-apps/sdk'
import { SHARE_START_PREFIX } from '@/lib/share-link'

// Для startapp-ссылок Telegram кладёт параметр в launch params
// (tgWebAppStartParam) — это канонический источник. initData.start_param
// заполняется не для всех типов запуска, поэтому используем его лишь как
// fallback (в т.ч. для dev-мока).
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
// программу (share_<shareId>), ведёт получателя на превью. Запускается один
// раз за сессию. Монтируется в Providers после инициализации SDK.
export function StartParamHandler() {
  const router  = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const startParam = readStartParam()
    if (startParam.startsWith(SHARE_START_PREFIX)) {
      const shareId = startParam.slice(SHARE_START_PREFIX.length)
      if (shareId) router.replace(`/share/${shareId}`)
    }
  }, [router])

  return null
}
