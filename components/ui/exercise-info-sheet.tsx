'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, ArrowUpRight } from 'lucide-react'
import type { WorkoutTemplateExercise } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'
import { useExercise } from '@/hooks/use-exercises'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { VideoModal } from '@/components/ui/video-modal'

function setsLabel(te: WorkoutTemplateExercise) {
  const vol = te.targetVolume
  const reps = vol.type === 'reps'
    ? vol.max ? `${vol.min}–${vol.max}` : String(vol.min)
    : `${vol.seconds}с`
  return `${te.targetSets} × ${reps}`
}

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

interface Props {
  te: WorkoutTemplateExercise
  onClose: () => void
}

export function ExerciseInfoSheet({ te, onClose }: Props) {
  const [showVideo, setShowVideo] = useState(false)
  const router = useRouter()
  const { data: liveExercise } = useExercise(te.exerciseId)
  const exercise  = liveExercise ?? te.exercise
  const color     = MUSCLE_GROUP_COLORS[exercise.muscleGroup]
  const youtubeId = exercise.videoUrl ? (exercise.videoUrl.match(YT_REGEX)?.[1] ?? null) : null
  const isShorts  = Boolean(exercise.videoUrl?.includes('/shorts/'))

  return (
    <>
      <BottomSheet open onClose={onClose}>
        <div className="px-4 pt-4 pb-8 flex flex-col gap-4">
          {/* Name + muscle + link icon */}
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-bold shrink-0"
              style={{ background: `${color}20`, border: `1.5px solid ${color}50`, color, fontFamily: 'var(--font-mono)' }}
            >
              {exercise.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold leading-tight" style={{ color: '#f9fafb' }}>{exercise.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: `${color}20`, color }}>
                  {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                </span>
                <span className="text-[12px]" style={{ color: '#6b7280' }}>{exercise.equipment}</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); router.push(`/library/exercises/${te.exerciseId}`) }}
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
              }}
            >
              <ArrowUpRight size={15} color="#9ca3af" />
            </button>
          </div>

          {/* Plan */}
          <div
            className="px-4 py-3 rounded-2xl flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <span className="text-[12px]" style={{ color: '#6b7280' }}>План</span>
            <span className="text-[13px] font-bold" style={{ color: '#f9fafb', fontFamily: 'var(--font-mono)' }}>
              {setsLabel(te)}{te.plannedWeight ? ` · ${te.plannedWeight} кг` : ''}
            </span>
          </div>

          {/* Description */}
          {exercise.description && (
            <p className="text-[14px] leading-relaxed" style={{ color: '#9ca3af' }}>
              {exercise.description}
            </p>
          )}

          {/* Video button */}
          {youtubeId && (
            <button
              onClick={() => setShowVideo(true)}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-[15px]"
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
              Смотреть видео
            </button>
          )}
        </div>
      </BottomSheet>

      {youtubeId && (
        <VideoModal
          open={showVideo}
          youtubeId={youtubeId}
          isShorts={isShorts}
          title={exercise.name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  )
}
