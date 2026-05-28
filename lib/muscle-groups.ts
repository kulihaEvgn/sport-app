import type { MuscleGroup } from '@/types'

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: '#ef4444',
  back: '#3b82f6',
  legs: '#a855f7',
  shoulders: '#f59e0b',
  biceps: '#ec4899',
  triceps: '#22d3ee',
  core: '#6b7280',
  other: '#9ca3af',
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечи',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  core: 'Кор',
  other: 'Другое',
}

export const MUSCLE_GROUP_ABBR: Record<MuscleGroup, string> = {
  chest: 'ГР',
  back: 'СП',
  legs: 'НО',
  shoulders: 'ПЛ',
  biceps: 'БЦ',
  triceps: 'ТР',
  core: 'КО',
  other: 'ДР',
}

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'other',
]
