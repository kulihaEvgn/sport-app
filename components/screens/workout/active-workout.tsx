'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, LayoutList, CreditCard, Timer, Check } from 'lucide-react'
import { useWorkoutStore } from '@/store/workout-store'
import { useLastExerciseSets } from '@/hooks/use-history'
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

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// --- Previous-result strip (reads from history) ---
function PrevResult({ userId, exerciseId }: { userId: string; exerciseId: string }) {
  const { data: prevSets } = useLastExerciseSets(userId, exerciseId)
  if (!prevSets?.length) return null

  const maxWeight = Math.max(...prevSets.map(s => s.weight))
  const totalReps  = prevSets.reduce((acc, s) => acc + s.reps, 0)

  return (
    <div
      className="mx-4 mb-2 rounded-2xl px-4 py-2 flex items-center justify-between"
      style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
        Предыдущий
      </span>
      <span className="text-[13px] font-bold" style={{ color: '#f9fafb', fontFamily: 'var(--font-mono)' }}>
        {maxWeight} кг · {prevSets.length}×{Math.round(totalReps / prevSets.length)} повт.
      </span>
    </div>
  )
}

// --- List view: all exercises with checkmarks ---
function ListView() {
  const { template, currentExerciseIndex, nextExercise, prevExercise } = useWorkoutStore()
  if (!template) return null

  return (
    <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2 pb-4">
      {template.exercises.map((te, idx) => {
        const isPast    = idx < currentExerciseIndex
        const isCurrent = idx === currentExerciseIndex
        const color     = MUSCLE_GROUP_COLORS[te.exercise.muscleGroup]

        return (
          <motion.div
            key={te.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: isCurrent ? 'rgba(74,222,128,0.06)' : '#1a1a2e',
              border: `1px solid ${isCurrent ? 'rgba(74,222,128,0.3)' : '#2d2d4e'}`,
              opacity: isPast ? 0.5 : 1,
            }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isPast ? 'rgba(74,222,128,0.15)' : `${color}15`, border: `1px solid ${isPast ? 'rgba(74,222,128,0.4)' : `${color}40`}` }}
            >
              {isPast
                ? <Check size={14} color="#4ade80" strokeWidth={2.5} />
                : <span className="text-[11px] font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{idx + 1}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: isCurrent ? '#f9fafb' : '#9ca3af' }}>
                {te.exercise.name}
              </p>
              <p className="text-[11px]" style={{ color: '#6b7280' }}>
                {te.targetSets} × {te.targetVolume.type === 'reps'
                  ? te.targetVolume.max ? `${te.targetVolume.min}-${te.targetVolume.max}` : String(te.targetVolume.min)
                  : `${te.targetVolume.seconds}с`}
                {te.plannedWeight ? ` · ${te.plannedWeight} кг` : ''}
              </p>
            </div>
            {isCurrent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}>
                СЕЙЧАС
              </span>
            )}
          </motion.div>
        )
      })}

      <div className="flex gap-2 mt-2">
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
        {currentExerciseIndex < template.exercises.length - 1 && (
          <button
            onClick={nextExercise}
            className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-1 text-[14px] font-semibold"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#f9fafb', cursor: 'pointer' }}
          >
            Далее
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ActiveWorkout({ onFinish, onDiscard }: Props) {
  const {
    template, activeWorkout, currentExerciseIndex, viewMode,
    restEndsAt, workoutStartedAt,
    nextExercise, prevExercise, logSet, startRest, stopRest,
    finishWorkout, discardWorkout, setViewMode,
  } = useWorkoutStore()

  const [sets, setSets]               = useState<SetEntry[]>([])
  const [showDiscard, setShowDiscard] = useState(false)
  const [elapsed, setElapsed]         = useState(0)
  const [restSecondsLeft, setRestSecondsLeft] = useState(0)
  const [direction, setDirection]     = useState(0) // +1 forward, -1 backward
  const prevIndexRef                  = useRef(currentExerciseIndex)

  const exercise = template?.exercises[currentExerciseIndex]
  const userId   = activeWorkout?.userId ?? ''

  // Workout elapsed timer
  useEffect(() => {
    const id = setInterval(() => {
      if (workoutStartedAt) setElapsed(Math.floor((Date.now() - workoutStartedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [workoutStartedAt])

  // Rest countdown
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

  // Reset sets on exercise change + track swipe direction
  useEffect(() => {
    if (!exercise) return
    setDirection(currentExerciseIndex > prevIndexRef.current ? 1 : -1)
    prevIndexRef.current = currentExerciseIndex

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

  function handleSetDone(idx: number) {
    const s = sets[idx]
    if (s.done) return
    setSets(prev => prev.map((se, i) => i === idx ? { ...se, done: true } : se))
    logSet({
      exerciseId:         ex.exerciseId,
      templateExerciseId: ex.id,
      setNumber:          idx + 1,
      weight:             parseFloat(s.weight) || 0,
      reps:               parseInt(s.reps) || 0,
      completedAt:        new Date(),
    })
    startRest(ex.restSeconds)
  }

  async function handleFinish() {
    await finishWorkout()
    const { lastLogId } = useWorkoutStore.getState()
    onFinish(lastLogId ?? '')
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 && currentExerciseIndex < totalExercises - 1) {
      nextExercise()
    } else if (info.offset.x > 60 && currentExerciseIndex > 0) {
      prevExercise()
    }
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
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
            {currentExerciseIndex + 1}/{totalExercises} · {formatTime(elapsed)}
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
        <motion.div
          className="h-full"
          style={{ background: '#4ade80' }}
          animate={{ width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Rest timer */}
      <AnimatePresence>
        {restSecondsLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center justify-between flex-shrink-0 overflow-hidden"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* List view */}
      {viewMode === 'list' ? (
        <ListView />
      ) : (
        /* Cards view */
        <>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentExerciseIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="flex flex-col flex-1 min-h-0"
              style={{ touchAction: 'pan-y' }}
            >
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

              {/* Previous result */}
              {userId && <PrevResult userId={userId} exerciseId={ex.exerciseId} />}

              {/* Sets */}
              <div className="px-4 flex flex-col gap-2 pb-2 flex-1 overflow-y-auto">
                {sets.map((set, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
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
                        { label: 'кг',    key: 'weight' as const, mode: 'decimal' as const, w: 'w-16' },
                        { label: 'повт.', key: 'reps'   as const, mode: 'numeric' as const, w: 'w-16' },
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
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

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
        </>
      )}

      {/* Discard confirmation */}
      <AnimatePresence>
        {showDiscard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full px-4 pb-8 pt-5 flex flex-col gap-3 rounded-t-3xl"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
            >
              <p className="text-[16px] font-semibold text-center" style={{ color: '#f9fafb' }}>Прервать тренировку?</p>
              <p className="text-[13px] text-center" style={{ color: '#6b7280' }}>Прогресс не сохранится</p>
              <button
                onClick={() => { discardWorkout(); onDiscard() }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
