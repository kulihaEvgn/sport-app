'use client'

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  rightSlot?: ReactNode
}

// Uppercase tracking-widest mono label used as a section heading throughout the app.
export function SectionLabel({ children, rightSlot }: Props) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[11px] font-bold tracking-widest uppercase"
        style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {children}
      </span>
      {rightSlot}
    </div>
  )
}
