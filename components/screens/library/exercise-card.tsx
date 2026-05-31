'use client'

import { ChevronRight } from 'lucide-react'
import type { Exercise } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_ABBR } from '@/lib/muscle-groups'

interface Props {
  exercise: Exercise
  onClick: () => void
}

export default function ExerciseCard({ exercise, onClick }: Props) {
  const color = MUSCLE_GROUP_COLORS[exercise.muscleGroup]
  const abbr = MUSCLE_GROUP_ABBR[exercise.muscleGroup]

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:opacity-70"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          color,
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        {abbr}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold truncate" style={{ color: '#f9fafb' }}>
          {exercise.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color: '#6b7280' }}>
            {exercise.equipment}
          </span>
        </div>
      </div>

      <ChevronRight size={16} color="#6b7280" />
    </button>
  )
}
