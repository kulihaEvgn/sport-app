'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { useExercises } from '@/hooks/use-exercises'
import { useCreateFullProgram } from '@/hooks/use-programs'
import { generateProgram } from '@/services/ai'
import type { AIGeneratedTemplate } from '@/services/programs'

type Goal = 'mass' | 'strength' | 'endurance' | 'fatLoss'
type Level = 'beginner' | 'intermediate' | 'advanced'

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'mass',       label: 'Масса',        emoji: '💪' },
  { value: 'strength',   label: 'Сила',          emoji: '🏋️' },
  { value: 'endurance',  label: 'Выносливость',  emoji: '🏃' },
  { value: 'fatLoss',    label: 'Похудение',     emoji: '🔥' },
]

const LEVELS: { value: Level; label: string }[] = [
  { value: 'beginner',      label: 'Новичок'     },
  { value: 'intermediate',  label: 'Средний'     },
  { value: 'advanced',      label: 'Продвинутый' },
]

const DAYS_OPTIONS = [2, 3, 4, 5, 6]

interface Props {
  open: boolean
  onClose: () => void
}

export default function AIProgramSheet({ open, onClose }: Props) {
  const router = useRouter()
  const { data: exercises = [] } = useExercises()
  const { mutateAsync: createFullProgram } = useCreateFullProgram()

  const [goal, setGoal]           = useState<Goal>('mass')
  const [level, setLevel]         = useState<Level>('intermediate')
  const [daysPerWeek, setDays]    = useState(3)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleGenerate() {
    if (exercises.length < 4) {
      setError('Добавь хотя бы 4 упражнения в библиотеку перед генерацией программы')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const availableExercises = exercises.map(e => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        equipment: e.equipment,
      }))

      const { program: raw } = await generateProgram({ daysPerWeek, goal, level, availableExercises })
      const rawProgram = raw as {
        name: string
        description?: string
        templates: AIGeneratedTemplate[]
      }

      const saved = await createFullProgram({
        name: rawProgram.name,
        description: rawProgram.description,
        daysPerWeek,
        templates: rawProgram.templates,
      })

      onClose()
      router.push(`/library/programs/${saved.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pt-4 pb-8 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-app-accent-dim)', border: '1px solid var(--color-app-accent-border-2)' }}
          >
            <Sparkles size={18} color="var(--color-app-accent)" />
          </div>
          <p className="text-[17px] font-bold" style={{ color: 'var(--color-app-text)' }}>
            Сгенерировать программу
          </p>
        </div>

        {/* Goal */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            Цель
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: goal === g.value ? 'var(--color-app-accent-dim)' : 'var(--color-app-surface2)',
                  border: `1px solid ${goal === g.value ? 'var(--color-app-accent-border-2)' : 'var(--color-app-border)'}`,
                  cursor: 'pointer',
                }}
              >
                <span className="text-[18px]">{g.emoji}</span>
                <span className="text-[13px] font-semibold"
                  style={{ color: goal === g.value ? 'var(--color-app-accent)' : 'var(--color-app-text)' }}>
                  {g.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            Уровень
          </label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className="flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all"
                style={{
                  background: level === l.value ? 'var(--color-app-accent-dim)' : 'var(--color-app-surface2)',
                  border: `1px solid ${level === l.value ? 'var(--color-app-accent-border-2)' : 'var(--color-app-border)'}`,
                  color: level === l.value ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
                  cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Days */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            Дней в неделю
          </label>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="w-10 h-10 rounded-xl text-[14px] font-bold transition-all flex-shrink-0"
                style={{
                  background: daysPerWeek === d ? 'var(--color-app-accent-soft)' : 'var(--color-app-surface2)',
                  border: `1px solid ${daysPerWeek === d ? 'var(--color-app-accent)' : 'var(--color-app-border)'}`,
                  color: daysPerWeek === d ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-[12px] px-3 py-2 rounded-xl" style={{ color: 'var(--color-app-error)', background: 'rgba(239,68,68,0.08)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-12 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all"
          style={{
            background: loading ? 'var(--color-app-border)' : 'var(--color-app-accent)',
            color: loading ? 'var(--color-app-muted)' : 'var(--color-app-on-accent)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Генерирую...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Сгенерировать
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
            Claude создаёт программу под твои параметры...
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
