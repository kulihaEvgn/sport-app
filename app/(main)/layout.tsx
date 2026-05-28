import BottomNav from '@/components/nav/bottom-nav'
import TelegramBackButtonSync from '@/components/tma/telegram-back-button-sync'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TelegramBackButtonSync />
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 100 }}>
        {children}
      </main>
      <BottomNav />
    </>
  )
}
