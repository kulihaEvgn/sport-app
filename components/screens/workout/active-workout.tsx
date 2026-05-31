'use client'

import { useState, useEffect } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
  type PanInfo,
} from 'framer-motion'
import { X, LayoutList, CreditCard, Timer, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { useWorkoutStore } from '@/store/workout-store'
import { useLastExerciseSets } from '@/hooks/use-history'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'
import { ConfirmAlert } from '@/components/ui/confirm-alert'
import type { WorkoutTemplateExercise } from '@/types'

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function setsLabel(te: WorkoutTemplateExercise) {
  const vol = te.targetVolume
  const reps = vol.type === 'reps'
    ? vol.max ? `${vol.min}–${vol.max}` : String(vol.min)
    : `${vol.seconds}с`
  return `${te.targetSets} × ${reps}`
}

// ─────────────────────────────────────────────────────────────────
// PrevResult chip
// ─────────────────────────────────────────────────────────────────

function PrevResult({ userId, exerciseId }: { userId: string; exerciseId: string }) {
  const { data: prevSets } = useLastExerciseSets(userId, exerciseId)
  if (!prevSets?.length) return null
  const maxWeight = Math.max(...prevSets.map(s => s.weight))
  const totalReps = prevSets.reduce((acc, s) => acc + s.reps, 0)
  return (
    <div
      className="rounded-xl px-3 py-2 flex items-center justify-between"
      style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
        Пред.
      </span>
      <span className="text-[13px] font-bold" style={{ color: '#f9fafb', fontFamily: 'var(--font-mono)' }}>
        {maxWeight} кг · {prevSets.length}×{Math.round(totalReps / prevSets.length)} повт.
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Shared action interface
// ─────────────────────────────────────────────────────────────────

interface WorkoutActions {
  weights: Record<string, string>
  setWeight: (teId: string, v: string) => void
  completedIds: Set<string>
  markDone: (te: WorkoutTemplateExercise) => void
  userId: string
}

// ─────────────────────────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────────────────────────

function ExerciseListRow({
  te, idx, actions,
}: {
  te: WorkoutTemplateExercise
  idx: number
  actions: WorkoutActions
}) {
  const { weights, setWeight, completedIds, markDone, userId } = actions
  const color  = MUSCLE_GROUP_COLORS[te.exercise.muscleGroup]
  const isDone = completedIds.has(te.id)
  const weight = weights[te.id] ?? (te.plannedWeight ? String(te.plannedWeight) : '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: isDone ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isDone ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.09)'}`,
        opacity: isDone ? 0.55 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      {/* Top: number + name + muscle + sets */}
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isDone ? 'rgba(74,222,128,0.15)' : `${color}15`,
            border: `1px solid ${isDone ? 'rgba(74,222,128,0.4)' : `${color}40`}`,
          }}
        >
          {isDone
            ? <Check size={14} color="#4ade80" strokeWidth={2.5} />
            : <span className="text-[11px] font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{idx + 1}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold" style={{ color: isDone ? '#6b7280' : '#f9fafb' }}>
            {te.exercise.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}20`, color }}>
              {MUSCLE_GROUP_LABELS[te.exercise.muscleGroup]}
            </span>
            <span className="text-[12px]" style={{ color: '#6b7280' }}>{setsLabel(te)}</span>
          </div>
        </div>
      </div>

      {/* Prev result + controls (only when not done) */}
      {!isDone && (
        <>
          {userId && <PrevResult userId={userId} exerciseId={te.exerciseId} />}
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium" style={{ color: '#6b7280' }}>Вес, кг</span>
              <input
                value={weight}
                onChange={e => setWeight(te.id, e.target.value)}
                placeholder="0"
                inputMode="decimal"
                className="w-20 text-center rounded-xl py-2 text-[16px] font-bold outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f9fafb',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <button
              onClick={() => markDone(te)}
              className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-bold text-[14px]"
              style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
                cursor: 'pointer',
              }}
            >
              <Check size={16} strokeWidth={2.5} />
              Выполнено
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

function WorkoutListView({
  exercises, actions, onFinish,
}: {
  exercises: WorkoutTemplateExercise[]
  actions: WorkoutActions
  onFinish: () => void
}) {
  const allDone = exercises.length > 0 && actions.completedIds.size >= exercises.length

  return (
    <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 py-4">
      {exercises.map((te, idx) => (
        <ExerciseListRow key={te.id} te={te} idx={idx} actions={actions} />
      ))}

      <AnimatePresence>
        {allDone && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={onFinish}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-[16px]"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
              color: '#052e16',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(74,222,128,0.4)',
            }}
          >
            <Check size={20} strokeWidth={3} />
            Завершить тренировку
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// TINDER VIEW
// ─────────────────────────────────────────────────────────────────

function TinderCard({
  te, isDone, weight, userId, onWeight, onSwipeDone, onSwipeSkip,
}: {
  te: WorkoutTemplateExercise
  isDone: boolean
  weight: string
  userId: string
  onWeight: (v: string) => void
  onSwipeDone: () => void
  onSwipeSkip: () => void
}) {
  const color = MUSCLE_GROUP_COLORS[te.exercise.muscleGroup]
  const x = useMotionValue(0)
  const rotate       = useTransform(x, [-180, 0, 180], [-14, 0, 14])
  const doneOpacity  = useTransform(x, [40, 110], [0, 1])
  const skipOpacity  = useTransform(x, [-110, -40], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 80)       onSwipeDone()
    else if (info.offset.x < -80) onSwipeSkip()
  }

  return (
    <motion.div
      key={te.id}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      style={{
        x, rotate,
        touchAction: 'pan-y',
        background: isDone ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isDone ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.09)'}`,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      onDragEnd={handleDragEnd}
      className="mx-4 rounded-3xl flex flex-col overflow-hidden relative flex-1"
    >
      {/* ✓ Done overlay (right swipe) */}
      <motion.div
        style={{ opacity: doneOpacity, pointerEvents: 'none' }}
        className="absolute inset-0 flex items-center justify-center rounded-3xl z-10"
        aria-hidden
      >
        <div
          className="absolute inset-0 rounded-3xl"
          style={{ background: 'rgba(74,222,128,0.18)' }}
        />
        <div
          className="relative flex flex-col items-center gap-2"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(74,222,128,0.9)', boxShadow: '0 0 40px rgba(74,222,128,0.6)' }}
          >
            <Check size={32} color="#052e16" strokeWidth={3} />
          </div>
          <span className="text-[18px] font-black tracking-wider" style={{ color: '#4ade80', textShadow: '0 0 20px rgba(74,222,128,0.8)' }}>
            ВЫПОЛНЕНО
          </span>
        </div>
      </motion.div>

      {/* → Skip overlay (left swipe) */}
      <motion.div
        style={{ opacity: skipOpacity, pointerEvents: 'none' }}
        className="absolute inset-0 flex items-center justify-center rounded-3xl z-10"
        aria-hidden
      >
        <div
          className="absolute inset-0 rounded-3xl"
          style={{ background: 'rgba(107,114,128,0.15)' }}
        />
        <div
          className="relative flex flex-col items-center gap-2"
          style={{ transform: 'rotate(12deg)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(107,114,128,0.7)' }}
          >
            <ChevronRight size={32} color="#f9fafb" strokeWidth={2.5} />
          </div>
          <span className="text-[18px] font-black tracking-wider" style={{ color: '#9ca3af' }}>
            ПРОПУСТИТЬ
          </span>
        </div>
      </motion.div>

      {/* Card content */}
      <div className="flex flex-col flex-1 p-5 gap-4 overflow-y-auto">
        {/* Done badge */}
        {isDone && (
          <div
            className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)' }}
          >
            <Check size={12} color="#4ade80" strokeWidth={3} />
            <span className="text-[11px] font-bold" style={{ color: '#4ade80' }}>Выполнено</span>
          </div>
        )}

        {/* Muscle group */}
        <span
          className="self-start text-[11px] font-bold px-2.5 py-1 rounded-xl"
          style={{ background: `${color}20`, color }}
        >
          {MUSCLE_GROUP_LABELS[te.exercise.muscleGroup]}
        </span>

        {/* Name + sets info */}
        <div>
          <h2 className="text-[26px] font-black leading-tight" style={{ color: '#f9fafb' }}>
            {te.exercise.name}
          </h2>
          <p className="text-[14px] mt-1" style={{ color: '#6b7280' }}>
            {setsLabel(te)}
            {te.plannedWeight ? ` · план ${te.plannedWeight} кг` : ''}
          </p>
        </div>

        {/* Prev result */}
        {userId && <PrevResult userId={userId} exerciseId={te.exerciseId} />}

        {/* Weight input */}
        {!isDone && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: '#6b7280' }}>Рабочий вес, кг</span>
            <input
              value={weight}
              onChange={e => onWeight(e.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="w-full text-center rounded-2xl py-4 text-[28px] font-black outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f9fafb',
                fontFamily: 'var(--font-mono)',
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Swipe hints */}
        {!isDone && (
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-1.5" style={{ color: '#4b5563' }}>
              <ChevronLeft size={16} />
              <span className="text-[11px] font-medium">Пропустить</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: '#4b5563' }}>
              <span className="text-[11px] font-medium">Выполнено</span>
              <ChevronRight size={16} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function WorkoutTinderView({
  exercises, actions, tinderIdx, setTinderIdx, onFinish,
}: {
  exercises: WorkoutTemplateExercise[]
  actions: WorkoutActions
  tinderIdx: number
  setTinderIdx: (fn: (i: number) => number) => void
  onFinish: () => void
}) {
  const allDone = exercises.length > 0 && actions.completedIds.size >= exercises.length
  const te = exercises[tinderIdx % exercises.length]
  const [exitDir, setExitDir] = useState(0)

  function handleSwipeDone() {
    if (!actions.completedIds.has(te.id)) {
      actions.markDone(te)
    }
    setExitDir(1)
    setTinderIdx(i => i + 1)
  }

  function handleSwipeSkip() {
    setExitDir(-1)
    setTinderIdx(i => i + 1)
  }

  const cardVariants = {
    enter:  { x: 0, opacity: 1, scale: 1 },
    exitR:  { x: 420, opacity: 0, rotate: 20, scale: 0.9, transition: { duration: 0.28 } },
    exitL:  { x: -420, opacity: 0, rotate: -20, scale: 0.9, transition: { duration: 0.28 } },
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 py-3 gap-3">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 px-4 flex-shrink-0">
        {exercises.map((ex, i) => {
          const done    = actions.completedIds.has(ex.id)
          const current = i === tinderIdx % exercises.length
          return (
            <div
              key={ex.id}
              className="rounded-full transition-all duration-300"
              style={{
                width:   current ? 20 : 8,
                height:  8,
                background: done
                  ? '#4ade80'
                  : current
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(255,255,255,0.15)',
              }}
            />
          )
        })}
      </div>

      {/* Card */}
      {allDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 mx-4 rounded-3xl flex flex-col items-center justify-center gap-4"
          style={{
            background: 'rgba(74,222,128,0.06)',
            border: '1px solid rgba(74,222,128,0.3)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(74,222,128,0.2)', border: '2px solid rgba(74,222,128,0.5)' }}
          >
            <Check size={36} color="#4ade80" strokeWidth={2.5} />
          </div>
          <p className="text-[18px] font-bold" style={{ color: '#f9fafb' }}>Все упражнения выполнены</p>
          <button
            onClick={onFinish}
            className="px-8 h-14 rounded-2xl flex items-center gap-2 font-bold text-[16px]"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
              color: '#052e16',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(74,222,128,0.4)',
            }}
          >
            <Check size={20} strokeWidth={3} />
            Завершить
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait" custom={exitDir}>
          <motion.div
            key={tinderIdx}
            initial={{ scale: 0.95, opacity: 0 }}
            animate="enter"
            exit={exitDir >= 0 ? 'exitR' : 'exitL'}
            variants={cardVariants}
            className="flex-1 flex flex-col min-h-0"
          >
            <TinderCard
              te={te}
              isDone={actions.completedIds.has(te.id)}
              weight={actions.weights[te.id] ?? (te.plannedWeight ? String(te.plannedWeight) : '')}
              userId={actions.userId}
              onWeight={v => actions.setWeight(te.id, v)}
              onSwipeDone={handleSwipeDone}
              onSwipeSkip={handleSwipeSkip}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

interface Props {
  onFinish: (logId: string) => void
  onDiscard: () => void
}

export default function ActiveWorkout({ onFinish, onDiscard }: Props) {
  const {
    template, activeWorkout,
    viewMode, restEndsAt, workoutStartedAt,
    logSet, startRest, stopRest,
    finishWorkout, discardWorkout, setViewMode,
  } = useWorkoutStore()

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [weights, setWeights]           = useState<Record<string, string>>({})
  const [tinderIdx, setTinderIdx]       = useState(0)
  const [showDiscard, setShowDiscard]   = useState(false)
  const [elapsed, setElapsed]           = useState(0)
  const [restLeft, setRestLeft]         = useState(0)

  const userId    = activeWorkout?.userId ?? ''
  const exercises = template?.exercises ?? []

  // Workout elapsed timer
  useEffect(() => {
    const id = setInterval(() => {
      if (workoutStartedAt) setElapsed(Math.floor((Date.now() - workoutStartedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [workoutStartedAt])

  // Rest countdown
  useEffect(() => {
    if (!restEndsAt) { setRestLeft(0); return }
    const tick = () => {
      const remaining = Math.ceil((restEndsAt.getTime() - Date.now()) / 1000)
      if (remaining <= 0) { setRestLeft(0); stopRest() }
      else setRestLeft(remaining)
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [restEndsAt, stopRest])

  if (!template) return null

  function setWeight(teId: string, v: string) {
    setWeights(prev => ({ ...prev, [teId]: v }))
  }

  function markDone(te: WorkoutTemplateExercise) {
    if (completedIds.has(te.id)) return
    const weight = parseFloat(weights[te.id] ?? '') || 0
    const defaultReps = te.targetVolume.type === 'reps' ? te.targetVolume.min : 0
    for (let i = 0; i < te.targetSets; i++) {
      logSet({
        exerciseId:         te.exerciseId,
        templateExerciseId: te.id,
        setNumber:          i + 1,
        weight,
        reps:               defaultReps,
        completedAt:        new Date(),
      })
    }
    setCompletedIds(prev => new Set([...prev, te.id]))
    startRest(te.restSeconds)
  }

  async function handleFinish() {
    await finishWorkout()
    const { lastLogId } = useWorkoutStore.getState()
    onFinish(lastLogId ?? '')
  }

  const actions: WorkoutActions = { weights, setWeight, completedIds, markDone, userId }
  const doneCount = completedIds.size

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-3 gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => setShowDiscard(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer' }}
        >
          <X size={16} color="#6b7280" />
        </button>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-[13px] font-semibold" style={{ color: '#f9fafb' }}>{template.name}</span>
          <span className="text-[11px]" style={{ color: '#6b7280' }}>
            {doneCount}/{exercises.length} · {formatTime(elapsed)}
          </span>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer' }}
        >
          {viewMode === 'cards'
            ? <LayoutList size={16} color="#6b7280" />
            : <CreditCard size={16} color="#6b7280" />
          }
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full"
          style={{ background: '#4ade80' }}
          animate={{ width: exercises.length ? `${(doneCount / exercises.length) * 100}%` : '0%' }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Rest timer */}
      <AnimatePresence>
        {restLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center justify-between flex-shrink-0 overflow-hidden"
            style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.25)' }}
          >
            <div className="flex items-center gap-2">
              <Timer size={15} color="#22d3ee" />
              <span className="text-[13px] font-medium" style={{ color: '#22d3ee' }}>Отдых</span>
            </div>
            <span className="text-[20px] font-bold" style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
              {formatTime(restLeft)}
            </span>
            <button
              onClick={stopRest}
              className="text-[12px] font-semibold px-3 py-1 rounded-xl"
              style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: 'none', cursor: 'pointer' }}
            >
              Пропустить
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      {viewMode === 'list' ? (
        <WorkoutListView exercises={exercises} actions={actions} onFinish={handleFinish} />
      ) : (
        <WorkoutTinderView
          exercises={exercises}
          actions={actions}
          tinderIdx={tinderIdx}
          setTinderIdx={setTinderIdx}
          onFinish={handleFinish}
        />
      )}

      <ConfirmAlert
        open={showDiscard}
        title="Прервать тренировку?"
        description="Прогресс этой тренировки не сохранится."
        confirmLabel="Прервать"
        cancelLabel="Продолжить"
        onConfirm={() => { discardWorkout(); onDiscard() }}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  )
}
