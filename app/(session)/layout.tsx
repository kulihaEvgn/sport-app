'use client'

import { useSafeAreaInsets } from '@/hooks/use-safe-area'

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  const { top, bottom } = useSafeAreaInsets()

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ paddingTop: top, paddingBottom: bottom }}
    >
      {children}
    </div>
  )
}
