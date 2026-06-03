'use client'

import { useState, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Trophy, Calendar, TrendingUp, ChevronDown } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { useExercises } from '@/hooks/use-exercises'
import { useWorkoutHistory } from '@/hooks/use-history'
import { useStreak, useMonthStats, useExerciseProgress } from '@/hooks/use-progress'
import ActivityHeatmap from './activity-heatmap'
import ProgressChart from './progress-chart'
import ExercisePicker from './exercise-picker'

const PERIODS = [
  { label: '1М',  param: '1m',  days: 30  },
  { label: '3М',  param: '3m',  days: 90  },
  { label: '6М',  param: '6m',  days: 180 },
  { label: 'Всё', param: 'all', days: 999 },
] as const

type PeriodParam = typeof PERIODS[number]['param']

export default function ProgressScreen() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const periodParam = (searchParams.get('period') ?? '3m') as PeriodParam
  const exerciseId  = searchParams.get('exercise')
  const period      = PERIODS.find(p => p.param === periodParam) ?? PERIODS[1]

  const [showPicker, setShowPicker] = useState(false)

  const { data: user }              = useUser()
  const uid                         = user?.id ?? ''
  const { data: exercises = [] }    = useExercises()
  const { data: history   = [] }    = useWorkoutHistory(uid)
  const { data: streak              = { current: 0, best: 0 } } = useStreak(uid)
  const { data: monthStats          = { totalWorkouts: 0, totalSets: 0, totalVolume: 0 } } = useMonthStats(uid)

  // Derive selected exercise from URL or first in list
  const selectedExId = exerciseId ?? exercises[0]?.id ?? ''
  const selectedEx   = exercises.find(e => e.id === selectedExId) ?? exercises[0] ?? null

  const { data: chartData = [] } = useExerciseProgress(uid, selectedExId, period.days)

  const workoutDates = useMemo(
    () => new Set(history.map(l => l.startedAt.toDateString())),
    [history],
  )

  const currentWeight = chartData.at(-1)?.weight ?? 0
  const firstWeight   = chartData[0]?.weight ?? 0
  const growthPct     = firstWeight > 0
    ? Math.round(((currentWeight - firstWeight) / firstWeight) * 100)
    : 0
  const pr = chartData.reduce<typeof chartData[number] | null>(
    (best, p) => (!best || p.weight > best.weight ? p : best),
    null,
  )

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col px-4 pt-5 gap-5 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[22px] font-bold"
        style={{ color: 'var(--color-app-text)' }}
      >
        Прогресс
      </motion.h1>

      {/* Activity card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl px-4 py-4 flex flex-col gap-3"
        style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            АКТИВНОСТЬ
          </span>
          <div className="flex items-center gap-1.5">
            <Flame size={14} color="#f59e0b" />
            <span className="text-[13px] font-bold" style={{ color: 'var(--color-app-text)' }}>{streak.current}</span>
            <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>подр.</span>
          </div>
        </div>

        <ActivityHeatmap workoutDates={workoutDates} />

        <div className="flex gap-5 pt-1">
          {[
            { value: monthStats.totalWorkouts, label: 'трен. за месяц' },
            { value: streak.best,              label: 'лучший streak'  },
            { value: streak.current,           label: 'текущий streak' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-[18px] font-bold" style={{ color: 'var(--color-app-accent)' }}>{stat.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Month stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        {[
          { Icon: Calendar,   color: 'var(--color-app-cyan)', value: monthStats.totalWorkouts,                      label: 'тренировок' },
          { Icon: TrendingUp, color: 'var(--color-app-accent)', value: monthStats.totalSets,                          label: 'подходов'   },
          { Icon: Trophy,     color: '#f59e0b', value: `${Math.round(monthStats.totalVolume / 1000)}к`, label: 'кг объём' },
        ].map(({ Icon, color, value, label }) => (
          <div
            key={label}
            className="flex-1 rounded-2xl px-3 py-3 flex flex-col gap-1"
            style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
          >
            <Icon size={16} color={color} />
            <div className="text-[20px] font-bold" style={{ color: 'var(--color-app-text)' }}>{value}</div>
            <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Progress chart card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl px-4 py-4 flex flex-col gap-4"
        style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
      >
        {/* Header + period selector */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            ПРОГРЕСС ВЕСА
          </span>
          <div className="flex gap-1">
            {PERIODS.map(p => {
              const active = period.param === p.param
              return (
                <button
                  key={p.param}
                  onClick={() => setParam('period', p.param)}
                  className="w-8 h-6 rounded-lg text-[11px] font-bold"
                  style={{
                    background: active ? 'var(--color-app-accent-mid)' : 'transparent',
                    color: active ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
                    border: `1px solid ${active ? 'var(--color-app-accent-border-3)' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercise selector */}
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: 'var(--color-app-card-alt)', border: '1px solid var(--color-app-card-border)', cursor: 'pointer' }}
        >
          <span className="text-[13px] font-semibold" style={{ color: 'var(--color-app-text)' }}>
            {selectedEx?.name ?? 'Выбери упражнение'}
          </span>
          <ChevronDown size={16} color="#6b7280" />
        </button>

        <ProgressChart points={chartData} />

        {/* Metrics */}
        <div className="flex gap-3">
          {[
            { label: 'текущий',   value: `${currentWeight} кг`,                              color: 'var(--color-app-accent)' },
            { label: 'за период', value: `${growthPct >= 0 ? '+' : ''}${growthPct}%`,        color: growthPct >= 0 ? 'var(--color-app-accent)' : 'var(--color-app-red)' },
            { label: 'сессий',    value: String(chartData.length),                           color: 'var(--color-app-text)' },
          ].map(m => (
            <div key={m.label} className="flex-1 text-center">
              <div className="text-[18px] font-bold" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* PR card */}
        <AnimatePresence>
          {pr && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <Trophy size={18} color="#f59e0b" />
              <div>
                <div className="text-[13px] font-bold" style={{ color: 'var(--color-app-text)' }}>
                  Личный рекорд: {pr.weight} кг
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>
                  {pr.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            exercises={exercises}
            selectedId={selectedEx?.id ?? null}
            onSelect={ex => {
              setParam('exercise', ex.id)
              setShowPicker(false)
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
