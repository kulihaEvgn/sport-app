'use client'

import { useSignal } from '@telegram-apps/sdk-react'
import {
  viewportSafeAreaInsetTop,
  viewportSafeAreaInsetBottom,
  isViewportMounted,
} from '@telegram-apps/sdk'

export function useSafeAreaInsets() {
  const mounted = useSignal(isViewportMounted)
  const top     = useSignal(viewportSafeAreaInsetTop)
  const bottom  = useSignal(viewportSafeAreaInsetBottom)

  return {
    top:    mounted ? Number(top)    || 0 : 0,
    bottom: mounted ? Number(bottom) || 0 : 0,
  }
}
