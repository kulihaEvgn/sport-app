'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { retrieveRawInitData } from '@telegram-apps/sdk'
import { SHARE_START_PREFIX } from '@/lib/share-link'

// Читает start_param из initData на старте Mini App и, если это ссылка на
// расшаренную программу (share_<shareId>), ведёт получателя на превью.
// Запускается один раз за сессию приложения. Монтируется в Providers после
// инициализации SDK, поэтому initData уже доступна.
export function StartParamHandler() {
  const router  = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    let startParam = ''
    try {
      const raw  = retrieveRawInitData() ?? ''
      startParam = new URLSearchParams(raw).get('start_param') ?? ''
    } catch {
      return
    }

    if (startParam.startsWith(SHARE_START_PREFIX)) {
      const shareId = startParam.slice(SHARE_START_PREFIX.length)
      if (shareId) router.replace(`/share/${shareId}`)
    }
  }, [router])

  return null
}
