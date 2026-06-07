'use client'

import { useEffect, useState } from 'react'
import { Send, Copy, Check, Link as LinkIcon } from 'lucide-react'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Spinner } from '@/components/ui/loader'
import { useShareProgram } from '@/hooks/use-programs'
import type { Program } from '@/types'

interface Props {
  open: boolean
  program: Program
  onClose: () => void
}

export default function ShareProgramSheet({ open, program, onClose }: Props) {
  const { mutateAsync: share, isPending } = useShareProgram()
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setCopied(false)
    if (program.shareId) {
      setShareUrl(`${window.location.origin}/share/${program.shareId}`)
      return
    }
    setShareUrl(null)
    share(program.id)
      .then(({ url }) => setShareUrl(url))
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка создания ссылки'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, program.id, program.shareId])

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback: select-show
      window.prompt('Скопируй ссылку:', shareUrl)
    }
  }

  function handleTelegramShare() {
    if (!shareUrl) return
    const text = `Программа тренировок: ${program.name}`
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    window.open(tgUrl, '_blank')
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pt-4 pb-8 flex flex-col gap-4">
        <p className="text-[17px] font-bold" style={{ color: 'var(--color-app-text)' }}>
          Поделиться программой
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-app-muted)' }}>
          У кого есть ссылка — может импортировать «{program.name}» в свою библиотеку.
        </p>

        {error && (
          <p className="text-[12px] px-3 py-2 rounded-xl"
            style={{ color: 'var(--color-app-error)', background: 'rgba(239,68,68,0.08)' }}>
            {error}
          </p>
        )}

        {/* URL preview */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
          style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)' }}>
          <LinkIcon size={14} color="var(--color-app-muted)" />
          {shareUrl ? (
            <span className="text-[12px] truncate flex-1"
              style={{ color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }}>
              {shareUrl}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
              {isPending && <Spinner size={12} color="var(--color-app-muted)" />}
              Создаю ссылку…
            </span>
          )}
        </div>

        {/* Telegram share */}
        <button
          onClick={handleTelegramShare}
          disabled={!shareUrl}
          className="h-12 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2"
          style={{
            background: shareUrl ? 'var(--color-app-accent)' : 'var(--color-app-border)',
            color:      shareUrl ? 'var(--color-app-on-accent)' : 'var(--color-app-muted)',
            border: 'none',
            cursor: shareUrl ? 'pointer' : 'not-allowed',
          }}
        >
          <Send size={16} />
          Отправить в Telegram
        </button>

        {/* Copy */}
        <button
          onClick={handleCopy}
          disabled={!shareUrl}
          className="h-11 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'var(--color-app-surface2)',
            color:      'var(--color-app-text)',
            border:     '1px solid var(--color-app-border)',
            cursor:     shareUrl ? 'pointer' : 'not-allowed',
            opacity:    shareUrl ? 1 : 0.5,
          }}
        >
          {copied ? <Check size={14} color="var(--color-app-accent)" /> : <Copy size={14} />}
          {copied ? 'Скопировано' : 'Скопировать ссылку'}
        </button>
      </div>
    </BottomSheet>
  )
}
