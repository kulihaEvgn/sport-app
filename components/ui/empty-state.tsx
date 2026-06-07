'use client'

import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  emoji?: string
  title: string
  description?: string
  action?: ReactNode
}

// Centered empty-state block: icon/emoji + title + optional description + action.
export function EmptyState({ icon, emoji, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
      {icon}
      {emoji && <span className="text-[32px]">{emoji}</span>}
      <p className="text-[15px] font-semibold text-center" style={{ color: 'var(--color-app-text)' }}>
        {title}
      </p>
      {description && (
        <p className="text-[13px] text-center leading-relaxed" style={{ color: 'var(--color-app-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
