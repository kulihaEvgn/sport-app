'use client'

import { useState, useEffect } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
  type PanInfo,
} from 'framer-motion'
import { X, LayoutList, CreditCard, Check, ChevronRight, ChevronLeft, RotateCcw, Play } from 'lucide-react'
import { useWorkoutStore } from '@/store/workout-store'
import { useLastExerciseSets } from '@/hooks/use-history'
import { useExercise } from '@/hooks/use-exercises'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'
import { ConfirmAlert } from '@/components/ui/confirm-alert'
import { ExerciseInfoSheet } from '@/components/ui/exercise-info-sheet'
import { VideoModal } from '@/components/ui/video-modal'
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
      style={{ background: 'var(--color-app-accent-glow)', border: '1px solid var(--color-app-accent-mid)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-app-accent)', fontFamily: 'var(--font-mono)' }}>
        Пред.
      </span>
      <span className="text-[13px] font-bold" style={{ color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }}>
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
  unmarkDone: (teId: string) => void
  userId: string
}

// ─────────────────────────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────────────────────────

function ExerciseListRow({
  te, idx, actions, onInfoClick,
}: {
  te: WorkoutTemplateExercise
  idx: number
  actions: WorkoutActions
  onInfoClick: (te: WorkoutTemplateExercise) => void
}) {
  const { weights, setWeight, completedIds, markDone, unmarkDone, userId } = actions
  const color  = MUSCLE_GROUP_COLORS[te.exercise.muscleGroup]
  const isDone = completedIds.has(te.id)
  const weight = weights[te.id] ?? (te.plannedWeight ? String(te.plannedWeight) : '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      onClick={() => onInfoClick(te)}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: isDone ? 'var(--color-app-accent-glow)' : 'var(--color-app-surface2)',
        border: `1px solid ${isDone ? 'var(--color-app-accent-border)' : 'var(--color-app-border)'}`,
        opacity: isDone ? 0.6 : 1,
        transition: 'opacity 0.3s',
        cursor: 'pointer',
      }}
    >
      {/* Top: check/number + name + muscle + sets + unmark */}
      <div className="flex items-start gap-3">
        <button
          onClick={e => { e.stopPropagation(); if (isDone) unmarkDone(te.id) }}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
          style={{
            background: isDone ? 'var(--color-app-accent-soft)' : `${color}15`,
            border: `1px solid ${isDone ? 'var(--color-app-accent-border-3)' : `${color}40`}`,
            cursor: isDone ? 'pointer' : 'default',
          }}
        >
          {isDone
            ? <Check size={14} color="var(--color-app-accent)" strokeWidth={2.5} />
            : <span className="text-[11px] font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{idx + 1}</span>
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold" style={{ color: isDone ? 'var(--color-app-muted)' : 'var(--color-app-text)' }}>
            {te.exercise.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}20`, color }}>
              {MUSCLE_GROUP_LABELS[te.exercise.muscleGroup]}
            </span>
            <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>{setsLabel(te)}</span>
          </div>
        </div>

        {isDone && (
          <button
            onClick={e => { e.stopPropagation(); unmarkDone(te.id) }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl flex-shrink-0"
            style={{
              background: 'var(--color-app-surface)',
              border: '1px solid var(--color-app-surface3)',
              color: 'var(--color-app-muted)',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            <RotateCcw size={11} />
            Отменить
          </button>
        )}
      </div>

      {/* Prev result + controls (only when not done) */}
      {!isDone && (
        <>
          {userId && <PrevResult userId={userId} exerciseId={te.exerciseId} />}
          <div className="flex items-end gap-3" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium" style={{ color: 'var(--color-app-muted)' }}>Вес, кг</span>
              <input
                value={weight}
                onChange={e => setWeight(te.id, e.target.value)}
                placeholder="0"
                inputMode="decimal"
                className="w-20 text-center rounded-xl py-2 text-[16px] font-bold outline-none"
                style={{
                  background: 'var(--color-app-surface)',
                  border: '1px solid var(--color-app-surface3)',
                  color: 'var(--color-app-text)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <button
              onClick={() => markDone(te)}
              className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-bold text-[14px]"
              style={{
                background: 'var(--color-app-accent-subtle)',
                border: '1px solid var(--color-app-accent-border-2)',
                color: 'var(--color-app-accent)',
                cursor: 'pointer',
              }}
            >
              <Check size={16} strokeWidth={2.5} />
              Готово
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
  const [infoTe, setInfoTe]           = useState<WorkoutTemplateExercise | null>(null)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const allDone = exercises.length > 0 && actions.completedIds.size >= exercises.length

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 py-4">
        {exercises.map((te, idx) => (
          <ExerciseListRow key={te.id} te={te} idx={idx} actions={actions} onInfoClick={setInfoTe} />
        ))}
      </div>

      {/* Pinned footer */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2 flex flex-col gap-2">
        <AnimatePresence>
          {allDone && (
            <motion.button
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={onFinish}
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-[16px]"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, var(--color-app-accent) 100%)',
                color: 'var(--color-app-accent-text)',
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

        {!allDone && (
          <button
            onClick={() => setConfirmFinish(true)}
            className="w-full h-11 rounded-2xl flex items-center justify-center font-semibold text-[14px]"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-app-surface3)',
              color: 'var(--color-app-muted)',
              cursor: 'pointer',
            }}
          >
            Завершить тренировку
          </button>
        )}
      </div>

      <ConfirmAlert
        open={confirmFinish}
        title="Завершить тренировку?"
        description="Не все упражнения отмечены. Тренировка будет засчитана как выполненная."
        confirmLabel="Завершить"
        onConfirm={() => { setConfirmFinish(false); onFinish() }}
        onCancel={() => setConfirmFinish(false)}
      />

      {infoTe && <ExerciseInfoSheet te={infoTe} onClose={() => setInfoTe(null)} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
// TINDER VIEW
// ─────────────────────────────────────────────────────────────────

function TinderCard({
  te, isDone, weight, userId, youtubeId, onWeight, onSwipeDone, onSwipeSkip, onVideoClick,
}: {
  te: WorkoutTemplateExercise
  isDone: boolean
  weight: string
  userId: string
  youtubeId: string | null
  onWeight: (v: string) => void
  onSwipeDone: () => void
  onSwipeSkip: () => void
  onVideoClick: () => void
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
        touchAction: 'none',
        background: isDone ? 'var(--color-app-accent-glow)' : 'var(--color-app-surface2)',
        border: `1px solid ${isDone ? 'var(--color-app-accent-border-2)' : 'var(--color-app-border)'}`,
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
          style={{ background: 'var(--color-app-accent-soft)' }}
        />
        <div
          className="relative flex flex-col items-center gap-2"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-app-accent-strong)', boxShadow: '0 0 40px rgba(74,222,128,0.6)' }}
          >
            <Check size={32} color="var(--color-app-on-accent)" strokeWidth={3} />
          </div>
          <span className="text-[18px] font-black tracking-wider" style={{ color: 'var(--color-app-accent)', textShadow: '0 0 20px rgba(74,222,128,0.8)' }}>
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
            <ChevronRight size={32} color="var(--color-app-text)" strokeWidth={2.5} />
          </div>
          <span className="text-[18px] font-black tracking-wider" style={{ color: 'var(--color-app-muted-2)' }}>
            ПРОПУСТИТЬ
          </span>
        </div>
      </motion.div>

      {/* Card content */}
      <div className="flex flex-col flex-1 p-5 gap-4 overflow-hidden justify-center">
        {/* Done badge */}
        {isDone && (
          <div
            className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'var(--color-app-accent-soft)', border: '1px solid var(--color-app-accent-border-3)' }}
          >
            <Check size={12} color="var(--color-app-accent)" strokeWidth={3} />
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-app-accent)' }}>Выполнено</span>
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
          <h2 className="text-[26px] font-black leading-tight" style={{ color: 'var(--color-app-text)' }}>
            {te.exercise.name}
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--color-app-muted)' }}>
            {setsLabel(te)}
            {te.plannedWeight ? ` · план ${te.plannedWeight} кг` : ''}
          </p>
        </div>

        {/* Prev result */}
        {userId && <PrevResult userId={userId} exerciseId={te.exerciseId} />}

        {/* Weight input */}
        {!isDone && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-app-muted)' }}>Рабочий вес, кг</span>
            <input
              value={weight}
              onChange={e => onWeight(e.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="w-full text-center rounded-2xl py-4 text-[28px] font-black outline-none"
              style={{
                background: 'var(--color-app-surface)',
                border: '1px solid var(--color-app-surface3)',
                color: 'var(--color-app-text)',
                fontFamily: 'var(--font-mono)',
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Video button */}
        {youtubeId && (
          <button
            onClick={e => { e.stopPropagation(); onVideoClick() }}
            className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              cursor: 'pointer',
            }}
          >
            <Play size={12} fill="#f87171" color="#f87171" />
            Видео
          </button>
        )}
      </div>
    </motion.div>
  )
}

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

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
  const [showVideo, setShowVideo] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const { data: liveExercise } = useExercise(te.exerciseId)
  const exercise  = liveExercise ?? te.exercise
  const youtubeId = exercise.videoUrl ? (exercise.videoUrl.match(YT_REGEX)?.[1] ?? null) : null
  const isShorts  = Boolean(exercise.videoUrl?.includes('/shorts/'))

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
    enter:  { x: 0, opacity: 1, scale: 1, transition: { duration: 0.22 } },
    exit: (dir: number) => ({
      x:       dir >= 0 ? 480 : -480,
      opacity: 0,
      rotate:  dir >= 0 ? 20 : -20,
      scale:   0.88,
      transition: { duration: 0.26 },
    }),
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
                  ? 'var(--color-app-accent)'
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
            background: 'var(--color-app-accent-glow)',
            border: '1px solid var(--color-app-accent-border-2)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-app-accent-mid)', border: '2px solid var(--color-app-accent-border-3)' }}
          >
            <Check size={36} color="var(--color-app-accent)" strokeWidth={2.5} />
          </div>
          <p className="text-[18px] font-bold" style={{ color: 'var(--color-app-text)' }}>Все упражнения выполнены</p>
          <button
            onClick={onFinish}
            className="px-8 h-14 rounded-2xl flex items-center gap-2 font-bold text-[16px]"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, var(--color-app-accent) 100%)',
              color: 'var(--color-app-accent-text)',
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
        <>
          <AnimatePresence mode="wait" custom={exitDir}>
            <motion.div
              key={tinderIdx}
              custom={exitDir}
              initial={{ scale: 0.95, opacity: 0 }}
              animate="enter"
              exit="exit"
              variants={cardVariants}
              className="flex-1 flex flex-col min-h-0"
            >
              <TinderCard
                te={te}
                isDone={actions.completedIds.has(te.id)}
                weight={actions.weights[te.id] ?? (te.plannedWeight ? String(te.plannedWeight) : '')}
                userId={actions.userId}
                youtubeId={youtubeId}
                onWeight={v => actions.setWeight(te.id, v)}
                onSwipeDone={handleSwipeDone}
                onSwipeSkip={handleSwipeSkip}
                onVideoClick={() => setShowVideo(true)}
              />
            </motion.div>
          </AnimatePresence>

          {/* Action hints */}
          <div className="flex gap-3 px-4 pb-2 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSwipeSkip}
              className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold text-[15px]"
              style={{
                background: 'var(--color-app-surface)',
                border: '1px solid var(--color-app-surface3)',
                color: 'var(--color-app-muted-2)',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} strokeWidth={2} />
              Пропустить
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSwipeDone}
              className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px]"
              style={{
                background: actions.completedIds.has(te.id)
                  ? 'var(--color-app-accent-subtle)'
                  : 'var(--color-app-accent-dim)',
                border: '1px solid var(--color-app-accent-border-2)',
                color: 'var(--color-app-accent)',
                cursor: 'pointer',
                boxShadow: actions.completedIds.has(te.id)
                  ? 'none'
                  : '0 0 20px rgba(74,222,128,0.15)',
              }}
            >
              Сделано
              <ChevronRight size={18} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Finish workout */}
          <div className="px-4 pb-2 flex-shrink-0">
            <button
              onClick={() => setConfirmFinish(true)}
              className="w-full h-11 rounded-2xl flex items-center justify-center font-semibold text-[14px]"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-app-surface3)',
                color: 'var(--color-app-muted)',
                cursor: 'pointer',
              }}
            >
              Завершить тренировку
            </button>
          </div>
        </>
      )}

      <ConfirmAlert
        open={confirmFinish}
        title="Завершить тренировку?"
        description="Не все упражнения отмечены. Тренировка будет засчитана как выполненная."
        confirmLabel="Завершить"
        onConfirm={() => { setConfirmFinish(false); onFinish() }}
        onCancel={() => setConfirmFinish(false)}
      />

      {youtubeId && (
        <VideoModal
          open={showVideo}
          youtubeId={youtubeId}
          isShorts={isShorts}
          title={exercise.name}
          onClose={() => setShowVideo(false)}
        />
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
    viewMode, workoutStartedAt,
    logSet,
    finishWorkout, discardWorkout, setViewMode,
  } = useWorkoutStore()

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [weights, setWeights]           = useState<Record<string, string>>({})
  const [tinderIdx, setTinderIdx]       = useState(0)
  const [showDiscard, setShowDiscard]   = useState(false)
  const [elapsed, setElapsed]           = useState(0)

  const userId    = activeWorkout?.userId ?? ''
  const exercises = template?.exercises ?? []

  // Workout elapsed timer
  useEffect(() => {
    const id = setInterval(() => {
      if (workoutStartedAt) setElapsed(Math.floor((Date.now() - workoutStartedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [workoutStartedAt])

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
  }

  function unmarkDone(teId: string) {
    setCompletedIds(prev => { const s = new Set(prev); s.delete(teId); return s })
  }

  async function handleFinish() {
    await finishWorkout()
    const { lastLogId } = useWorkoutStore.getState()
    onFinish(lastLogId ?? '')
  }

  const actions: WorkoutActions = { weights, setWeight, completedIds, markDone, unmarkDone, userId }
  const doneCount = completedIds.size

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-3 gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-app-surface)' }}
      >
        <button
          onClick={() => setShowDiscard(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'var(--color-app-surface)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
        >
          <X size={16} color="var(--color-app-muted)" />
        </button>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--color-app-text)' }}>{template.name}</span>
          <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>
            {doneCount}/{exercises.length} · {formatTime(elapsed)}
          </span>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'var(--color-app-surface)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
        >
          {viewMode === 'cards'
            ? <LayoutList size={16} color="var(--color-app-muted)" />
            : <CreditCard size={16} color="var(--color-app-muted)" />
          }
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'var(--color-app-surface)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'var(--color-app-accent)' }}
          animate={{ width: exercises.length ? `${(doneCount / exercises.length) * 100}%` : '0%' }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Views */}
      <AnimatePresence mode="wait" initial={false}>
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <WorkoutListView exercises={exercises} actions={actions} onFinish={handleFinish} />
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <WorkoutTinderView
              exercises={exercises}
              actions={actions}
              tinderIdx={tinderIdx}
              setTinderIdx={setTinderIdx}
              onFinish={handleFinish}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
