'use client'

import { Trophy } from 'lucide-react'
import type { WorkoutLog } from '@/types'

interface Props {
  log: WorkoutLog
  onClose: () => void
}

export default function WorkoutSummary({ log, onClose }: Props) {
  const duration = log.finishedAt
    ? Math.round((log.finishedAt.getTime() - log.startedAt.getTime()) / 60000)
    : 0
  const totalSets   = log.sets.length
  const totalVolume = log.sets.reduce((s, set) => s + set.weight * set.reps, 0)

  return (
    <div className="flex flex-col items-center px-4 pt-10 pb-8 gap-6 min-h-full">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
      >
        <Trophy size={40} color="#4ade80" />
      </div>

      <div className="text-center">
        <h2 className="text-[24px] font-bold" style={{ color: '#f9fafb' }}>Тренировка завершена!</h2>
        <p className="text-[14px] mt-1" style={{ color: '#6b7280' }}>Отличная работа 💪</p>
      </div>

      <div className="w-full flex gap-3">
        {[
          { label: 'Время',    value: `${duration} мин` },
          { label: 'Подходов', value: String(totalSets) },
          { label: 'Объём',    value: `${Math.round(totalVolume / 1000)}к кг` },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex-1 rounded-2xl px-3 py-4 flex flex-col items-center gap-1"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
          >
            <span className="text-[22px] font-bold" style={{ color: '#4ade80' }}>{stat.value}</span>
            <span className="text-[11px]" style={{ color: '#6b7280' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full h-14 rounded-2xl text-[16px] font-bold"
        style={{ background: '#4ade80', color: '#0f172a', border: 'none', cursor: 'pointer' }}
      >
        Готово
      </button>
    </div>
  )
}
