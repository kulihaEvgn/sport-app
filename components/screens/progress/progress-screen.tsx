'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Flame, Trophy, Calendar, TrendingUp, ChevronDown } from 'lucide-react'
import type { Exercise } from '@/types'
import type { ExerciseProgressPoint } from '@/services/progress'
import { getExercises } from '@/services/exercises'
import { getWorkoutHistory } from '@/services/history'
import { getStreak, getMonthStats, getExerciseProgress } from '@/services/progress'
import { MOCK_USER } from '@/data/mock'
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
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const periodParam  = (searchParams.get('period') ?? '3m') as PeriodParam
  const exerciseId   = searchParams.get('exercise')

  const period = PERIODS.find(p => p.param === periodParam) ?? PERIODS[1]

  const [streak, setStreak]         = useState({ current: 0, best: 0 })
  const [monthStats, setMonth]      = useState({ totalWorkouts: 0, totalSets: 0, totalVolume: 0 })
  const [workoutDates, setDates]    = useState<Set<string>>(new Set())
  const [exercises, setExercises]   = useState<Exercise[]>([])
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null)
  const [chartData, setChartData]   = useState<ExerciseProgressPoint[]>([])
  const [showPicker, setShowPicker] = useState(false)

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Load static data once
  useEffect(() => {
    const uid = MOCK_USER.id
    Promise.all([
      getStreak(uid).then(setStreak),
      getMonthStats(uid).then(setMonth),
      getWorkoutHistory(uid).then(logs => {
        setDates(new Set(logs.map(l => l.startedAt.toDateString())))
      }),
      getExercises().then(exs => {
        setExercises(exs)
        // Set initial exercise from URL or default to first
        const fromUrl = exerciseId ? exs.find(e => e.id === exerciseId) : null
        setSelectedEx(fromUrl ?? exs[0] ?? null)
      }),
    ])
  }, [])

  // Sync selectedEx when URL exerciseId changes
  useEffect(() => {
    if (!exercises.length) return
    const ex = exerciseId ? exercises.find(e => e.id === exerciseId) : exercises[0]
    if (ex) setSelectedEx(ex)
  }, [exerciseId, exercises])

  // Load chart data when exercise or period changes
  useEffect(() => {
    if (!selectedEx) return
    getExerciseProgress(MOCK_USER.id, selectedEx.id, period.days).then(setChartData)
  }, [selectedEx, period.days])

  const currentWeight = chartData.at(-1)?.weight ?? 0
  const firstWeight   = chartData[0]?.weight ?? 0
  const growthPct     = firstWeight > 0
    ? Math.round(((currentWeight - firstWeight) / firstWeight) * 100)
    : 0
  const pr = chartData.reduce<ExerciseProgressPoint | null>(
    (best, p) => (!best || p.weight > best.weight ? p : best),
    null,
  )

  return (
    <div className="flex flex-col px-4 pt-5 gap-5 pb-4">
      <h1 className="text-[22px] font-bold" style={{ color: '#f9fafb' }}>Прогресс</h1>

      {/* Activity card */}
      <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            АКТИВНОСТЬ
          </span>
          <div className="flex items-center gap-1.5">
            <Flame size={14} color="#f59e0b" />
            <span className="text-[13px] font-bold" style={{ color: '#f9fafb' }}>{streak.current}</span>
            <span className="text-[12px]" style={{ color: '#6b7280' }}>подр.</span>
          </div>
        </div>

        <ActivityHeatmap workoutDates={workoutDates} />

        <div className="flex gap-5 pt-1">
          <div>
            <div className="text-[18px] font-bold" style={{ color: '#4ade80' }}>{monthStats.totalWorkouts}</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>трен. за месяц</div>
          </div>
          <div>
            <div className="text-[18px] font-bold" style={{ color: '#4ade80' }}>{streak.best}</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>лучший streak</div>
          </div>
          <div>
            <div className="text-[18px] font-bold" style={{ color: '#4ade80' }}>{streak.current}</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>текущий streak</div>
          </div>
        </div>
      </div>

      {/* Month stats row */}
      <div className="flex gap-3">
        {[
          { icon: <Calendar size={16} color="#22d3ee" />, value: monthStats.totalWorkouts,                     label: 'тренировок' },
          { icon: <TrendingUp size={16} color="#4ade80" />, value: monthStats.totalSets,                       label: 'подходов'   },
          { icon: <Trophy size={16} color="#f59e0b" />,    value: `${Math.round(monthStats.totalVolume/1000)}к`, label: 'кг объём'  },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex-1 rounded-2xl px-3 py-3 flex flex-col gap-1"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
          >
            {stat.icon}
            <div className="text-[20px] font-bold" style={{ color: '#f9fafb' }}>{stat.value}</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress chart card */}
      <div className="rounded-2xl px-4 py-4 flex flex-col gap-4" style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}>
        {/* Header + period selector */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
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
                    background: active ? 'rgba(74,222,128,0.2)' : 'transparent',
                    color: active ? '#4ade80' : '#6b7280',
                    border: `1px solid ${active ? 'rgba(74,222,128,0.4)' : 'transparent'}`,
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
          style={{ background: '#16213e', border: '1px solid #2d2d4e', cursor: 'pointer' }}
        >
          <span className="text-[13px] font-semibold" style={{ color: '#f9fafb' }}>
            {selectedEx?.name ?? 'Выбери упражнение'}
          </span>
          <ChevronDown size={16} color="#6b7280" />
        </button>

        <ProgressChart points={chartData} />

        {/* Metrics */}
        <div className="flex gap-3">
          {[
            { label: 'текущий',  value: `${currentWeight} кг`, color: '#4ade80' },
            { label: 'за период', value: `${growthPct >= 0 ? '+' : ''}${growthPct}%`, color: growthPct >= 0 ? '#4ade80' : '#ef4444' },
            { label: 'сессий',   value: String(chartData.length), color: '#f9fafb' },
          ].map(m => (
            <div key={m.label} className="flex-1 text-center">
              <div className="text-[18px] font-bold" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[11px]" style={{ color: '#6b7280' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* PR card */}
        {pr && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <Trophy size={18} color="#f59e0b" />
            <div>
              <div className="text-[13px] font-bold" style={{ color: '#f9fafb' }}>
                Личный рекорд: {pr.weight} кг
              </div>
              <div className="text-[11px]" style={{ color: '#6b7280' }}>
                {pr.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  )
}
