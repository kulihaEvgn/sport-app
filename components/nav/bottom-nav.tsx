'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Zap, TrendingUp } from 'lucide-react'

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
        background: 'linear-gradient(transparent, #0f0f0f 40%)',
      }}
    >
      <nav
        className="flex items-center h-[60px] px-1 pointer-events-auto"
        style={{
          background: '#1a1a2e',
          borderRadius: 28,
          border: '1px solid #2d2d4e',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {TABS.map((tab, idx) => {
          const isActive  = pathname.startsWith(tab.href)
          const isCenter  = idx === 1 // Тренировка — центральная акцентная

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center justify-center gap-1.5 transition-all duration-200 no-underline"
              style={{
                flex: isCenter ? '0 0 auto' : '1 1 0',
                height: isCenter ? 48 : 52,
                borderRadius: isCenter ? 20 : 24,
                padding: isActive || isCenter ? '0 18px' : '0',
                minWidth: isCenter ? 80 : 0,
                background: isCenter
                  ? isActive
                    ? 'rgba(74,222,128,0.2)'
                    : 'rgba(74,222,128,0.08)'
                  : isActive
                    ? 'rgba(74,222,128,0.12)'
                    : 'transparent',
                border: isCenter ? '1px solid rgba(74,222,128,0.3)' : undefined,
                margin: isCenter ? '0 4px' : 0,
              }}
            >
              <tab.Icon
                size={isCenter ? 22 : 20}
                color={isActive || isCenter ? '#4ade80' : '#6b7280'}
                strokeWidth={isActive || isCenter ? 2.5 : 1.8}
              />
              {isActive && (
                <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: '#4ade80' }}>
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
