'use client'

import Header from '@/components/nav/header'
import BottomNav from '@/components/nav/bottom-nav'
import TelegramBackButtonSync from '@/components/tma/telegram-back-button-sync'
import { useSafeAreaInsets } from '@/hooks/use-safe-area'

const NAV_HEIGHT = 80 // высота BottomNav + градиент

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { top, bottom } = useSafeAreaInsets()

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingTop: top }}>
      <TelegramBackButtonSync />
      <Header />
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: NAV_HEIGHT + bottom, overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </main>
      <BottomNav bottomInset={bottom} />
    </div>
  )
}
