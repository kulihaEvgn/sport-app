'use client'

import type { MuscleGroup } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'

interface Props {
  muscleGroup: MuscleGroup
  size?: 'sm' | 'md'
}

// Tinted pill for a muscle group, color comes from MUSCLE_GROUP_COLORS.
export function MuscleChip({ muscleGroup, size = 'md' }: Props) {
  const color = MUSCLE_GROUP_COLORS[muscleGroup]
  const small = size === 'sm'
  return (
    <span
      className={`font-medium rounded-md ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5 rounded-lg'}`}
      style={{ background: `${color}20`, color }}
    >
      {MUSCLE_GROUP_LABELS[muscleGroup]}
    </span>
  )
}
