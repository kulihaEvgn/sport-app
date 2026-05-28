export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'other'

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Equipment =
  | 'Штанга'
  | 'Гантели'
  | 'Блок'
  | 'Тренажёр'
  | 'Без инвентаря'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  difficulty: Difficulty
  equipment: Equipment
  videoUrl?: string
  description?: string
  imageUrl?: string
  createdAt: Date
}

export interface WorkoutTemplateExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  order: number
  targetSets: number
  targetReps: string
  restSeconds: number
  needsWarmup: boolean
  rirTarget: number
  plannedWeight?: number
}

export interface WorkoutTemplate {
  id: string
  programId: string
  dayNumber: number
  name: string
  exercises: WorkoutTemplateExercise[]
}

export interface Program {
  id: string
  name: string
  description?: string
  daysPerWeek: number
  isActive: boolean
  templates: WorkoutTemplate[]
  createdAt: Date
}

export interface SetLog {
  id: string
  workoutLogId: string
  exerciseId: string
  setNumber: number
  isWarmup: boolean
  weight: number
  reps: number
  rir: number
  completedAt: Date
}

export interface WorkoutLog {
  id: string
  userId: string
  workoutTemplateId: string
  startedAt: Date
  finishedAt?: Date
  isCompleted: boolean
  sets: SetLog[]
}

export interface User {
  id: string
  username?: string
  firstName: string
  avatarUrl?: string
  currentDayIndex: number
}
