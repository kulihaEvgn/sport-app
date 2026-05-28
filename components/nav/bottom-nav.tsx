'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Zap, TrendingUp, User } from 'lucide-react'

const TABS = [
  { href: '/library',  label: 'Библиотека', Icon: BookOpen   },
  { href: '/workout',  label: 'Тренировка', Icon: Zap        },
  { href: '/progress', label: 'Прогресс',   Icon: TrendingUp },
  { href: '/profile',  label: 'Профиль',    Icon: User       },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 px-4 pb-5 pointer-events-none"
      style={{ zIndex: 100, background: 'linear-gradient(transparent, #0f0f0f 40%)' }}
    >
      <nav
        className="flex items-center gap-1 h-[60px] px-1 pointer-events-auto"
        style={{
          background: '#1a1a2e',
          borderRadius: 28,
          border: '1px solid #2d2d4e',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {TABS.map(tab => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center justify-center gap-1.5 h-[52px] transition-all duration-200 no-underline"
              style={{
                flex: isActive ? '0 0 auto' : '1 1 0',
                borderRadius: 24,
                background: isActive ? 'rgba(74,222,128,0.12)' : 'transparent',
                padding: isActive ? '0 18px' : '0',
                minWidth: 0,
              }}
            >
              <tab.Icon
                size={20}
                color={isActive ? '#4ade80' : '#6b7280'}
                strokeWidth={isActive ? 2.5 : 1.8}
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
