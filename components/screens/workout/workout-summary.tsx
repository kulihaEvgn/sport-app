'use client'

import { motion } from 'framer-motion'
import { Trophy, Clock, Dumbbell, TrendingUp } from 'lucide-react'
import type { WorkoutLog } from '@/types'

interface Props {
  log: WorkoutLog
  onClose: () => void
}

export default function WorkoutSummary({ log, onClose }: Props) {
  const duration    = log.finishedAt
    ? Math.round((log.finishedAt.getTime() - log.startedAt.getTime()) / 60000)
    : 0
  const totalSets   = log.sets.length
  const totalVolume = log.sets.reduce((s, set) => s + set.weight * set.reps, 0)

  // Group sets by templateExerciseId to show per-exercise breakdown
  const exerciseGroups = log.sets.reduce<Record<string, typeof log.sets>>((acc, s) => {
    const key = s.templateExerciseId
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const exerciseIds = Object.keys(exerciseGroups)

  return (
    <div className="flex flex-col px-4 pt-8 pb-8 gap-5 min-h-full overflow-y-auto">
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
        className="flex flex-col items-center gap-3"
      >
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
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3"
      >
        {[
          { label: 'Время',    value: `${duration} мин`,                  Icon: Clock },
          { label: 'Подходов', value: String(totalSets),                   Icon: Dumbbell },
          { label: 'Объём',    value: `${Math.round(totalVolume / 1000)}к кг`, Icon: TrendingUp },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="flex-1 rounded-2xl px-3 py-4 flex flex-col items-center gap-1"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
          >
            <Icon size={16} color="#4ade80" />
            <span className="text-[20px] font-bold" style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>{value}</span>
            <span className="text-[11px]" style={{ color: '#6b7280' }}>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Per-exercise breakdown */}
      {exerciseIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col gap-2"
        >
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Упражнения
          </span>
          {exerciseIds.map((teId, i) => {
            const sets     = exerciseGroups[teId]
            const maxWeight = Math.max(...sets.map(s => s.weight))
            const totalReps = sets.reduce((a, s) => a + s.reps, 0)

            return (
              <motion.div
                key={teId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="rounded-2xl px-4 py-3 flex items-center justify-between"
                style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
              >
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: '#f9fafb' }}>
                    Упражнение {i + 1}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#6b7280' }}>
                    {sets.length} подх. · {totalReps} повт.
                  </p>
                </div>
                <span className="text-[16px] font-bold" style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                  {maxWeight} кг
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onClose}
        className="w-full h-14 rounded-2xl text-[16px] font-bold mt-auto"
        style={{ background: '#4ade80', color: '#0f172a', border: 'none', cursor: 'pointer' }}
      >
        Готово
      </motion.button>
    </div>
  )
}
