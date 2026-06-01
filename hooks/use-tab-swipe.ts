'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setNavDirection } from '@/lib/nav-direction'

const TABS = ['/library', '/workout', '/progress']
const SWIPE_MIN_X  = 72  // px — minimum horizontal travel
const LOCK_MIN     = 10  // px — after this we commit to a direction

export function useTabSwipe(ref: React.RefObject<HTMLElement | null>) {
  const router   = useRouter()
  const pathname = usePathname()

  // Keep pathname in a ref so the listener closure is stable
  const pathnameRef = useRef(pathname)
  useEffect(() => { pathnameRef.current = pathname }, [pathname])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX  = 0
    let startY  = 0
    let locked: 'h' | 'v' | null = null

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      locked = null
    }

    function onTouchMove(e: TouchEvent) {
      if (locked) return
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (dx > LOCK_MIN || dy > LOCK_MIN) {
        locked = dx > dy ? 'h' : 'v'
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (locked !== 'h') return

      const path = pathnameRef.current
      // Skip: tinder cards already handle horizontal drag
      if (path.includes('/session')) return

      const dx = e.changedTouches[0].clientX - startX
      if (Math.abs(dx) < SWIPE_MIN_X) return

      const idx = TABS.findIndex(t => path.startsWith(t))
      if (idx === -1) return

      if (dx < 0 && idx < TABS.length - 1) { setNavDirection('left');  router.push(TABS[idx + 1]) }
      if (dx > 0 && idx > 0)               { setNavDirection('right'); router.push(TABS[idx - 1]) }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [ref, router])
}
