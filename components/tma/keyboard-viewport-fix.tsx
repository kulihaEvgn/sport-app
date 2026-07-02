'use client'

import { useEffect } from 'react'

/**
 * Фикс «скачущего» экрана при открытии клавиатуры.
 *
 * Приложение — фиксированный shell (`fixed inset-0; overflow:hidden`), реальный
 * скролл живёт во внутренних контейнерах. Но iOS / Telegram WebView при фокусе
 * инпута прокручивают САМ документ, чтобы показать каретку, и утаскивают весь
 * фиксированный shell вверх — вёрстка «ломается» и не возвращается после
 * закрытия клавиатуры. Документ скроллиться не должен никогда, поэтому жёстко
 * держим прокрутку окна в нуле. Внутренние `overflow-y-auto` контейнеры при
 * этом продолжают доскроллливаться к инпуту сами.
 */
export function KeyboardViewportFix() {
  useEffect(() => {
    const pin = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0)
      }
    }

    // iOS прокручивает уже ПОСЛЕ события focus — гасим на нескольких кадрах.
    const onFocusIn = () => {
      pin()
      requestAnimationFrame(pin)
      setTimeout(pin, 100)
      setTimeout(pin, 300)
    }

    window.addEventListener('scroll', pin, { passive: true })
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('resize', pin)

    const vv = window.visualViewport
    vv?.addEventListener('resize', pin)
    vv?.addEventListener('scroll', pin)

    return () => {
      window.removeEventListener('scroll', pin)
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('resize', pin)
      vv?.removeEventListener('resize', pin)
      vv?.removeEventListener('scroll', pin)
    }
  }, [])

  return null
}
