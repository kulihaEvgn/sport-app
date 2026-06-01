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
            style={{ background: 'var(--color-app-bg)', color: 'var(--color-app-text)', fontFamily: 'var(--font-ibm), sans-serif' }}
          >
            {/* Ambient glow blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
              <div style={{
                position: 'absolute', width: 600, height: 600,
                top: -200, left: -200,
                background: 'radial-gradient(circle, var(--color-app-glow-indigo) 0%, transparent 65%)',
                borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute', width: 400, height: 400,
                bottom: -80, right: -100,
                background: 'radial-gradient(circle, var(--color-app-accent-glow) 0%, transparent 65%)',
                borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute', width: 350, height: 350,
                top: '45%', left: '55%', transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle, var(--color-app-glow-purple) 0%, transparent 65%)',
                borderRadius: '50%',
              }} />
            </div>
            <div className="relative flex flex-col flex-1 overflow-hidden" style={{ zIndex: 1 }}>
              {children}
            </div>
          </div>
        </ProvidersShell>
      </body>
    </html>
  )
}
