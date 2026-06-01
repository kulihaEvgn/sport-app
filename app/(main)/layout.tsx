'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '@/components/nav/header'
import BottomNav from '@/components/nav/bottom-nav'
import TelegramBackButtonSync from '@/components/tma/telegram-back-button-sync'
import { useSafeAreaInsets } from '@/hooks/use-safe-area'
import { useTabSwipe } from '@/hooks/use-tab-swipe'
import { getNavDirection } from '@/lib/nav-direction'

const NAV_HEIGHT = 80

const variants = {
  enter:  (d: 'left' | 'right') => ({ x: d === 'left' ? '100%' : '-100%' }),
  center: { x: 0 },
  exit:   (d: 'left' | 'right') => ({ x: d === 'left' ? '-100%' : '100%' }),
}

const transition = { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const }

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { top, bottom } = useSafeAreaInsets()
  const pathname = usePathname()
  const tabKey   = pathname.split('/')[1] // 'library' | 'workout' | 'progress'
  const mainRef  = useRef<HTMLDivElement>(null)
  useTabSwipe(mainRef)

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingTop: top }}>
      <TelegramBackButtonSync />
      <Header />
      <div ref={mainRef} className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="sync" custom={getNavDirection()}>
          <motion.div
            key={tabKey}
            custom={getNavDirection()}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 overflow-y-auto"
            style={{ paddingBottom: NAV_HEIGHT + bottom, overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav bottomInset={bottom} />
    </div>
  )
}
