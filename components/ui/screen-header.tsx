'use client'

import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  title?: ReactNode
  onBack?: () => void
  backLabel?: string
  rightSlot?: ReactNode
  withBorder?: boolean
}

// Reusable session-style header: back button + centered title + optional right slot.
export function ScreenHeader({ title, onBack, backLabel = 'Назад', rightSlot, withBorder = true }: Props) {
  return (
    <div
      className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
      style={withBorder ? { borderBottom: '1px solid var(--color-app-border)' } : undefined}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-accent)' }}
        >
          <ArrowLeft size={18} color="var(--color-app-accent)" />
          {backLabel}
        </button>
      ) : <span style={{ width: 60 }} />}

      {title != null && (
        <span className="text-[16px] font-semibold truncate px-2" style={{ color: 'var(--color-app-text)' }}>
          {title}
        </span>
      )}

      <div className="flex items-center gap-2 justify-end" style={{ minWidth: 60 }}>
        {rightSlot}
      </div>
    </div>
  )
}
