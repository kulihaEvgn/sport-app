'use client'

import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from '@/hooks/use-safe-area'

interface Props {
  onClick: () => void
  icon?: ReactNode
  ariaLabel?: string
  bottomOffset?: number
}

// Floating action button positioned above the bottom nav, respects safe-area inset.
export function FAB({ onClick, icon, ariaLabel = 'Действие', bottomOffset = 88 }: Props) {
  const { bottom } = useSafeAreaInsets()

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform"
      style={{
        bottom: bottomOffset + bottom,
        right: 20,
        width: 52,
        height: 52,
        background: 'var(--color-app-accent)',
        border: 'none',
        cursor: 'pointer',
        zIndex: 50,
        boxShadow: '0 4px 24px rgba(74,222,128,0.4)',
      }}
    >
      {icon ?? <Plus size={24} color="var(--color-app-on-accent)" strokeWidth={2.5} />}
    </button>
  )
}
