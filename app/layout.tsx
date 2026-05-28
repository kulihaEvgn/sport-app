import type { Metadata } from 'next'
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { ProvidersShell } from '@/components/providers-shell'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-ibm',
})

const jetBrainsMono = JetBrains_Mono({
  weight: ['500', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'GymApp',
  description: 'Telegram Mini App для трекинга тренировок',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${ibmPlexSans.variable} ${jetBrainsMono.variable} dark`}>
      <body>
        <ProvidersShell>
          <div
            className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ background: '#0f0f0f', color: '#f9fafb', fontFamily: 'var(--font-ibm), sans-serif' }}
          >
            {children}
          </div>
        </ProvidersShell>
      </body>
    </html>
  )
}
