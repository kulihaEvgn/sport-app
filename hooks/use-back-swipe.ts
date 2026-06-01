'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setNavDirection } from '@/lib/nav-direction'

const SWIPE_MIN  = 80  // px horizontal travel to trigger

export function useBackSwipe(ref: React.RefObject<HTMLElement | null>) {
  const router = useRouter()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX  = 0
    let startY  = 0

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      if (dx > SWIPE_MIN && dx > dy) { setNavDirection('right'); router.back() }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [ref, router])
}
