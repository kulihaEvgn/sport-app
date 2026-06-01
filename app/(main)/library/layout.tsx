'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Dumbbell } from 'lucide-react'

const TABS = [
  { href: '/library/programs',  label: 'Программы',  Icon: BookOpen  },
  { href: '/library/exercises', label: 'Упражнения', Icon: Dumbbell },
]

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTabRoot = pathname === '/library/programs' || pathname === '/library/exercises'

  return (
    <div className="flex flex-col min-h-full">
      {isTabRoot && (
        <div className="px-4 pt-5 pb-0">
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--color-app-text)' }}>Библиотека</h1>
          <div
            className="flex gap-1 mt-3 p-1 rounded-2xl"
            style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
          >
            {TABS.map(({ href, label, Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 no-underline"
                  style={{
                    background: active ? 'var(--color-app-card-alt)' : 'transparent',
                    border: active ? '1px solid var(--color-app-card-border)' : '1px solid transparent',
                    color: active ? 'var(--color-app-text)' : 'var(--color-app-muted)',
                  }}
                >
                  <Icon size={15} color={active ? 'var(--color-app-accent)' : 'var(--color-app-muted)'} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
      <div className={isTabRoot ? 'flex-1 mt-2' : 'flex-1'}>
        {children}
      </div>
    </div>
  )
}
