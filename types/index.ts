export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'other'

// Используется в схемах и формах
export type Equipment =
  | 'Штанга'
  | 'Гантели'
  | 'Блок'
  | 'Тренажёр'
  | 'Без инвентаря'

// Целевой объём подхода: повторы ИЛИ время — без смешения в строке
export type TargetVolume =
  | { type: 'reps'; min: number; max?: number }
  | { type: 'time'; seconds: number }

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string
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
  targetVolume: TargetVolume
  restSeconds: number
  plannedWeight?: number
}

export interface WorkoutTemplate {
  id: string
  programId: string
  order: number           // позиция дня в цикле (0..cycleLength-1)
  name: string
  exercises: WorkoutTemplateExercise[]
}

// cycleLength === templates.length (инвариант)
export interface Program {
  id: string
  name: string
  description?: string
  daysPerWeek: number
  cycleLength: number
  isActive: boolean
  shareId?: string
  templates: WorkoutTemplate[]
  createdAt: Date
}

// Прогресс пользователя по конкретной программе
export interface UserProgramState {
  userId: string
  programId: string
  currentDayIndex: number  // 0..cycleLength-1
}

export interface SetLog {
  id: string
  workoutLogId: string
  exerciseId: string
  templateExerciseId: string
  setNumber: number
  weight: number
  reps: number
  completedAt: Date
}

export interface WorkoutLog {
  id: string
  userId: string
  programId: string
  workoutTemplateId: string
  dayIndex: number          // снимок currentDayIndex на момент старта
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
}
