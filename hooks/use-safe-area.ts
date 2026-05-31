'use client'

import { useSignal } from '@telegram-apps/sdk-react'
import {
  viewportSafeAreaInsetTop,
  viewportSafeAreaInsetBottom,
  viewportContentSafeAreaInsetTop,
  viewportContentSafeAreaInsetBottom,
  isViewportMounted,
} from '@telegram-apps/sdk'

export function useSafeAreaInsets() {
  const mounted      = useSignal(isViewportMounted)
  const sysTop       = useSignal(viewportSafeAreaInsetTop)
  const sysBottom    = useSignal(viewportSafeAreaInsetBottom)
  const contentTop    = useSignal(viewportContentSafeAreaInsetTop)
  const contentBottom = useSignal(viewportContentSafeAreaInsetBottom)

  return {
    top:    mounted ? (Number(sysTop) || 0) + (Number(contentTop) || 0) : 0,
    bottom: mounted ? (Number(sysBottom) || 0) + (Number(contentBottom) || 0) : 0,
  }
}
