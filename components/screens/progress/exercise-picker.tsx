'use client'

import type { Exercise } from '@/types'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'
import { BottomSheet } from '@/components/ui/bottom-sheet'

interface Props {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExercisePicker({ exercises, selectedId, onSelect, onClose }: Props) {
  return (
    <BottomSheet open onClose={onClose} maxHeight="65vh">
      <p className="text-[15px] font-bold px-4 pt-3 pb-2" style={{ color: 'var(--color-app-text)' }}>Выбери упражнение</p>
      <div className="overflow-y-auto pb-6">
        {exercises.map(ex => {
          const active = ex.id === selectedId
          return (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full text-left px-4 py-3 flex items-center gap-3"
              style={{
                background: active ? 'var(--color-app-accent-subtle)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                style={{
                  background: `${MUSCLE_GROUP_COLORS[ex.muscleGroup]}20`,
                  color: MUSCLE_GROUP_COLORS[ex.muscleGroup],
                }}
              >
                {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
              </span>
              <span className="text-[14px]" style={{ color: active ? 'var(--color-app-accent)' : 'var(--color-app-text)' }}>
                {ex.name}
              </span>
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
