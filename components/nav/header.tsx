'use client'

import { useRouter } from 'next/navigation'
import { useSignal } from '@telegram-apps/sdk-react'
import { initDataUser } from '@telegram-apps/sdk'

export default function Header() {
  const router = useRouter()
  const user   = useSignal(initDataUser)

  const initials = user?.first_name?.slice(0, 1).toUpperCase() ?? 'G'

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
      <span className="text-[18px] font-bold" style={{ color: 'var(--color-app-text)' }}>
        GymApp
      </span>
      <button
        onClick={() => router.push('/profile')}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold transition-opacity active:opacity-70"
        style={{
          background: 'var(--color-app-accent-soft)',
          border: '1px solid var(--color-app-accent-border-2)',
          color: 'var(--color-app-accent)',
          cursor: 'pointer',
        }}
      >
        {initials}
      </button>
    </div>
  )
}
