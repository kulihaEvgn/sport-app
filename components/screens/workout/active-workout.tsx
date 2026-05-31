'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, LayoutList, CreditCard, Timer, Check } from 'lucide-react'
import { useWorkoutStore } from '@/store/workout-store'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'

interface SetEntry {
  weight: string
  reps: string
  done: boolean
}

interface Props {
  onFinish: (logId: string) => void
  onDiscard: () => void
}

export default function ActiveWorkout({ onFinish, onDiscard }: Props) {
  const {
    template, currentExerciseIndex, viewMode,
    restEndsAt, workoutStartedAt,
    nextExercise, prevExercise, logSet, startRest, stopRest,
    finishWorkout, discardWorkout, setViewMode,
  } = useWorkoutStore()

  const [sets, setSets]             = useState<SetEntry[]>([])
  const [showDiscard, setShowDiscard] = useState(false)
  const [elapsed, setElapsed]       = useState(0)
  const [restSecondsLeft, setRestSecondsLeft] = useState(0)

  const exercise = template?.exercises[currentExerciseIndex]

  // Workout elapsed timer
  useEffect(() => {
    const id = setInterval(() => {
      if (workoutStartedAt) setElapsed(Math.floor((Date.now() - workoutStartedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [workoutStartedAt])

  // Rest countdown derived from restEndsAt
  useEffect(() => {
    if (!restEndsAt) {
      setRestSecondsLeft(0)
      return
    }
    const tick = () => {
      const remaining = Math.ceil((restEndsAt.getTime() - Date.now()) / 1000)
      if (remaining <= 0) {
        setRestSecondsLeft(0)
        stopRest()
      } else {
        setRestSecondsLeft(remaining)
      }
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [restEndsAt, stopRest])

  // Reset sets on exercise change
  useEffect(() => {
    if (!exercise) return
    const defaultReps = exercise.targetVolume.type === 'reps'
      ? String(exercise.targetVolume.min)
      : '0'
    setSets(
      Array.from({ length: exercise.targetSets }, () => ({
        weight: exercise.plannedWeight ? String(exercise.plannedWeight) : '',
        reps: defaultReps,
        done: false,
      })),
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseIndex, exercise?.id])

  if (!template || !exercise) return null

  const ex             = exercise
  const totalExercises = template.exercises.length

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function handleSetDone(idx: number) {
    const s = sets[idx]
    if (s.done) return
    setSets(prev => prev.map((se, i) => i === idx ? { ...se, done: true } : se))
    logSet({
      exerciseId: ex.exerciseId,
      templateExerciseId: ex.id,
      setNumber: idx + 1,
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps) || 0,
      completedAt: new Date(),
    })
    startRest(ex.restSeconds)
  }

  async function handleFinish() {
    await finishWorkout()
    const { lastLogId } = useWorkoutStore.getState()
    onFinish(lastLogId ?? '')
  }

  async function handleDiscard() {
    discardWorkout()
    onDiscard()
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-3 gap-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #2d2d4e' }}
      >
        <button
          onClick={() => setShowDiscard(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', cursor: 'pointer' }}
        >
          <X size={16} color="#6b7280" />
        </button>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-[13px] font-semibold" style={{ color: '#f9fafb' }}>{template.name}</span>
          <span className="text-[11px]" style={{ color: '#6b7280' }}>
            {currentExerciseIndex}/{totalExercises} · {formatTime(elapsed)}
          </span>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', cursor: 'pointer' }}
        >
          {viewMode === 'cards'
            ? <LayoutList size={16} color="#6b7280" />
            : <CreditCard size={16} color="#6b7280" />
          }
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 flex-shrink-0" style={{ background: '#1a1a2e' }}>
        <div
          className="h-full transition-all duration-300"
          style={{ background: '#4ade80', width: `${(currentExerciseIndex / totalExercises) * 100}%` }}
        />
      </div>

      {/* Rest timer */}
      {restSecondsLeft > 0 && (
        <div
          className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)' }}
        >
          <div className="flex items-center gap-2">
            <Timer size={16} color="#22d3ee" />
            <span className="text-[13px] font-medium" style={{ color: '#22d3ee' }}>Отдых</span>
          </div>
          <span className="text-[20px] font-bold" style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
            {formatTime(restSecondsLeft)}
          </span>
          <button
            onClick={stopRest}
            className="text-[12px] font-semibold px-3 py-1 rounded-xl"
            style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: 'none', cursor: 'pointer' }}
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Exercise info */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            {currentExerciseIndex + 1} / {totalExercises}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={{
              background: `${MUSCLE_GROUP_COLORS[ex.exercise.muscleGroup]}20`,
              color: MUSCLE_GROUP_COLORS[ex.exercise.muscleGroup],
            }}
          >
            {MUSCLE_GROUP_LABELS[ex.exercise.muscleGroup]}
          </span>
        </div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: '#f9fafb' }}>
          {ex.exercise.name}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: '#6b7280' }}>
          {ex.targetSets} подходов ×{' '}
          {ex.targetVolume.type === 'reps'
            ? ex.targetVolume.max
              ? `${ex.targetVolume.min}-${ex.targetVolume.max}`
              : String(ex.targetVolume.min)
            : `${ex.targetVolume.seconds}с`}
          {ex.plannedWeight ? ` · план ${ex.plannedWeight} кг` : ''}
        </p>
      </div>

      {/* Sets */}
      <div className="px-4 flex flex-col gap-2 pb-2 flex-1 overflow-y-auto">
        {sets.map((set, idx) => (
          <div
            key={idx}
            className="rounded-2xl px-3 py-3 flex items-center gap-2 transition-all"
            style={{
              background: set.done ? 'rgba(74,222,128,0.08)' : '#1a1a2e',
              border: `1px solid ${set.done ? 'rgba(74,222,128,0.3)' : '#2d2d4e'}`,
              opacity: set.done ? 0.7 : 1,
            }}
          >
            <span className="text-[13px] font-bold w-5 flex-shrink-0" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
              {idx + 1}
            </span>

            <div className="flex-1 flex gap-2">
              {[
                { label: 'кг',    key: 'weight' as const, mode: 'decimal'  as const, w: 'w-16' },
                { label: 'повт.', key: 'reps'   as const, mode: 'numeric'  as const, w: 'w-16' },
              ].map(({ label, key, mode, w }) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px]" style={{ color: '#6b7280' }}>{label}</span>
                  <input
                    value={set[key]}
                    onChange={e => setSets(prev => prev.map((s, i) => i === idx ? { ...s, [key]: e.target.value } : s))}
                    disabled={set.done}
                    className={`${w} text-center rounded-xl py-1.5 text-[15px] font-bold outline-none`}
                    style={{ background: '#16213e', border: '1px solid #2d2d4e', color: '#f9fafb', fontFamily: 'var(--font-mono)' }}
                    inputMode={mode}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSetDone(idx)}
              disabled={set.done}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: set.done ? 'rgba(74,222,128,0.2)' : 'rgba(74,222,128,0.1)',
                border: `1px solid ${set.done ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.2)'}`,
                cursor: set.done ? 'default' : 'pointer',
              }}
            >
              <Check size={18} color="#4ade80" />
            </button>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 pt-2 flex gap-2 flex-shrink-0">
        {currentExerciseIndex > 0 && (
          <button
            onClick={prevExercise}
            className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-1 text-[14px] font-semibold"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#6b7280', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} />
            Назад
          </button>
        )}
        {currentExerciseIndex < totalExercises - 1 ? (
          <button
            onClick={nextExercise}
            className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-1 text-[14px] font-semibold"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#f9fafb', cursor: 'pointer' }}
          >
            Далее
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-bold"
            style={{ background: '#4ade80', color: '#0f172a', border: 'none', cursor: 'pointer' }}
          >
            <Check size={18} strokeWidth={3} />
            Завершить тренировку
          </button>
        )}
      </div>

      {/* Discard confirmation */}
      {showDiscard && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full px-4 pb-8 pt-5 flex flex-col gap-3 rounded-t-3xl"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
          >
            <p className="text-[16px] font-semibold text-center" style={{ color: '#f9fafb' }}>Прервать тренировку?</p>
            <p className="text-[13px] text-center" style={{ color: '#6b7280' }}>Прогресс не сохранится</p>
            <button
              onClick={handleDiscard}
              className="w-full h-12 rounded-2xl font-bold text-[15px]"
              style={{ background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Прервать
            </button>
            <button
              onClick={() => setShowDiscard(false)}
              className="w-full h-12 rounded-2xl font-medium text-[15px]"
              style={{ background: '#16213e', color: '#f9fafb', border: '1px solid #2d2d4e', cursor: 'pointer' }}
            >
              Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
