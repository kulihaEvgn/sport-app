'use client'

import { ChevronRight, Zap } from 'lucide-react'

interface Props {
  onGoToLibrary: () => void
}

export default function NoProgramView({ onGoToLibrary }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-8 py-20">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{ background: 'var(--color-app-accent-subtle)', border: '1px solid var(--color-app-accent-mid)' }}
      >
        <Zap size={48} color="var(--color-app-accent)" />
      </div>
      <div className="text-center">
        <h2 className="text-[20px] font-bold" style={{ color: 'var(--color-app-text)' }}>Нет активной программы</h2>
        <p className="text-[14px] mt-2 leading-relaxed" style={{ color: 'var(--color-app-muted)' }}>
          Выбери программу из библиотеки чтобы начать тренироваться
        </p>
      </div>
      <button
        onClick={onGoToLibrary}
        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-bold"
        style={{ background: 'var(--color-app-accent)', color: 'var(--color-app-on-accent)', border: 'none', cursor: 'pointer' }}
      >
        Выбрать программу
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
