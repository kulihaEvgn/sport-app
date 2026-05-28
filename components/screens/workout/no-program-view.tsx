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
        style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}
      >
        <Zap size={48} color="#4ade80" />
      </div>
      <div className="text-center">
        <h2 className="text-[20px] font-bold" style={{ color: '#f9fafb' }}>Нет активной программы</h2>
        <p className="text-[14px] mt-2 leading-relaxed" style={{ color: '#6b7280' }}>
          Выбери программу из библиотеки чтобы начать тренироваться
        </p>
      </div>
      <button
        onClick={onGoToLibrary}
        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-bold"
        style={{ background: '#4ade80', color: '#0f172a', border: 'none', cursor: 'pointer' }}
      >
        Выбрать программу
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
