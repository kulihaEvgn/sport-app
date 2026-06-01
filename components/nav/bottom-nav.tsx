'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Zap, TrendingUp } from 'lucide-react'
import { setNavDirection } from '@/lib/nav-direction'

const TABS = [
  { href: '/library',  label: 'Библиотека', Icon: BookOpen   },
  { href: '/workout',  label: 'Тренировка', Icon: Zap        },
  { href: '/progress', label: 'Прогресс',   Icon: TrendingUp },
]

interface Props {
  bottomInset?: number
}

export default function BottomNav({ bottomInset = 0 }: Props) {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 px-4 pointer-events-none"
      style={{
        paddingBottom: 12 + bottomInset,
        zIndex: 100,
        background: 'linear-gradient(transparent, var(--color-app-bg) 40%)',
      }}
    >
      <nav
        className="flex items-center h-[60px] px-1 pointer-events-auto"
        style={{
          background: 'var(--color-app-surface)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: 28,
          border: '1px solid var(--color-app-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {TABS.map((tab, idx) => {
          const isActive    = pathname.startsWith(tab.href)
          const isCenter    = idx === 1
          const currentIdx  = TABS.findIndex(t => pathname.startsWith(t.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => { if (!isActive) setNavDirection(idx > currentIdx ? 'left' : 'right') }}
              className="flex items-center justify-center gap-1.5 transition-all duration-200 no-underline"
              style={{
                flex: isCenter ? '0 0 auto' : '1 1 0',
                height: isCenter ? 48 : 52,
                borderRadius: isCenter ? 20 : 24,
                padding: isActive || isCenter ? '0 18px' : '0',
                minWidth: isCenter ? 80 : 0,
                background: isCenter
                  ? isActive
                    ? 'var(--color-app-accent-mid)'
                    : 'var(--color-app-accent-subtle)'
                  : isActive
                    ? 'var(--color-app-accent-dim)'
                    : 'transparent',
                border: isCenter ? '1px solid var(--color-app-accent-border-2)' : undefined,
                margin: isCenter ? '0 4px' : 0,
              }}
            >
              <tab.Icon
                size={isCenter ? 22 : 20}
                color={isActive || isCenter ? 'var(--color-app-accent)' : 'var(--color-app-muted)'}
                strokeWidth={isActive || isCenter ? 2.5 : 1.8}
              />
              {isActive && (
                <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: 'var(--color-app-accent)' }}>
                  {tab.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
