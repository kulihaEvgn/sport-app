'use client'

import { useState } from 'react'
import { ArrowLeft, Edit2, Trash2, Play } from 'lucide-react'
import type { Exercise } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ABBR } from '@/lib/muscle-groups'
import { useDeleteExercise } from '@/hooks/use-exercises'
import { ConfirmAlert } from '@/components/ui/confirm-alert'
import { VideoModal } from '@/components/ui/video-modal'

interface Props {
  exercise: Exercise
  onBack: () => void
  onEdit: (exercise: Exercise) => void
  onDeleted: () => void
}

export default function ExerciseDetail({ exercise, onBack, onEdit, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const { mutateAsync: deleteExercise, isPending: deleting } = useDeleteExercise()
  const color = MUSCLE_GROUP_COLORS[exercise.muscleGroup]
  const abbr = MUSCLE_GROUP_ABBR[exercise.muscleGroup]

  async function handleDelete() {
    await deleteExercise(exercise.id)
    onDeleted()
  }

  const youtubeId = exercise.videoUrl
    ? exercise.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null
    : null
  const isShorts = Boolean(exercise.videoUrl?.includes('/shorts/'))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-app-border)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-accent)' }}
        >
          <ArrowLeft size={18} color="var(--color-app-accent)" />
          Назад
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(exercise)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--color-app-surface)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
          >
            <Edit2 size={14} color="var(--color-app-muted)" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
          >
            <Trash2 size={14} color="var(--color-app-red)" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Avatar + title */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-[16px] font-bold flex-shrink-0"
            style={{
              background: `${color}20`,
              border: `1.5px solid ${color}50`,
              color,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {abbr}
          </div>
          <div>
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--color-app-text)' }}>
              {exercise.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: `${color}20`, color }}
              >
                {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
              </span>
              <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
                {exercise.equipment}
              </span>
            </div>
          </div>
        </div>

        {/* Equipment row */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'var(--color-app-surface)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--color-app-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <span className="text-[12px] font-medium" style={{ color: 'var(--color-app-muted)' }}>Инвентарь</span>
          <span className="text-[12px] font-semibold ml-auto" style={{ color }}>
            {exercise.equipment}
          </span>
        </div>

        {/* Description */}
        {exercise.description && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
              ОПИСАНИЕ
            </span>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-app-text-secondary)' }}>
              {exercise.description}
            </p>
          </div>
        )}
      </div>

      {/* Pinned video button */}
      {youtubeId && (
        <div className="flex-shrink-0 px-4 pb-6 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setShowVideo(true)}
            className="w-full h-13 flex items-center justify-center gap-2.5 rounded-2xl font-bold text-[15px]"
            style={{
              height: 52,
              background: 'linear-gradient(135deg, #c0392b 0%, #ef4444 100%)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
            }}
          >
            <Play size={18} fill="#fff" color="#fff" />
            Видео
          </button>
        </div>
      )}

      <ConfirmAlert
        open={confirmDelete}
        title={`Удалить «${exercise.name}»?`}
        description="Упражнение будет удалено из базы безвозвратно."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
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
