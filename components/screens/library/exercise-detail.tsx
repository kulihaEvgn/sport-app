'use client'

import { useState } from 'react'
import { ArrowLeft, Edit2, Trash2, ExternalLink, Play } from 'lucide-react'
import type { Exercise } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ABBR } from '@/lib/muscle-groups'
import { deleteExercise } from '@/services/exercises'
import { ConfirmAlert } from '@/components/ui/confirm-alert'

interface Props {
  exercise: Exercise
  onBack: () => void
  onEdit: (exercise: Exercise) => void
  onDeleted: () => void
}

export default function ExerciseDetail({ exercise, onBack, onEdit, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const color = MUSCLE_GROUP_COLORS[exercise.muscleGroup]
  const abbr = MUSCLE_GROUP_ABBR[exercise.muscleGroup]

  async function handleDelete() {
    await deleteExercise(exercise.id)
    onDeleted()
  }

  const youtubeId = exercise.videoUrl
    ? exercise.videoUrl.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    : null

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80' }}
        >
          <ArrowLeft size={18} color="#4ade80" />
          Назад
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(exercise)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer' }}
          >
            <Edit2 size={14} color="#6b7280" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
          >
            <Trash2 size={14} color="#ef4444" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
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
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: '#f9fafb' }}>
              {exercise.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: `${color}20`, color }}
              >
                {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
              </span>
              <span className="text-[12px]" style={{ color: '#6b7280' }}>
                {exercise.equipment}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <span className="text-[12px] font-medium" style={{ color: '#6b7280' }}>Инвентарь</span>
          <span className="text-[12px] font-semibold ml-auto" style={{ color }}>
            {exercise.equipment}
          </span>
        </div>

        {/* YouTube preview */}
        {youtubeId && (
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.9)' }}
              >
                <Play size={24} color="#fff" fill="#fff" />
              </div>
            </a>
          </div>
        )}
        {exercise.videoUrl && !youtubeId && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', color: '#22d3ee', textDecoration: 'none' }}
          >
            <ExternalLink size={15} />
            Смотреть видео
          </a>
        )}

        {/* Description */}
        {exercise.description && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
              ОПИСАНИЕ
            </span>
            <p className="text-[14px] leading-relaxed" style={{ color: '#d1d5db' }}>
              {exercise.description}
            </p>
          </div>
        )}
      </div>

      <ConfirmAlert
        open={confirmDelete}
        title={`Удалить «${exercise.name}»?`}
        description="Упражнение будет удалено из базы безвозвратно."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
