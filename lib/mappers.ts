import type {
  Exercise,
  Program,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutLog,
  SetLog,
  User,
  UserProgramState,
  TargetVolume,
} from '@/types'
import type {
  Exercise as PExercise,
  WorkoutTemplate as PTemplate,
  WorkoutTemplateExercise as PTemplateExercise,
  Program as PProgram,
  WorkoutLog as PWorkoutLog,
  SetLog as PSetLog,
  User as PUser,
  UserProgramState as PUserProgramState,
} from '@prisma/client'

type PTemplateExerciseWithExercise = PTemplateExercise & { exercise: PExercise }
type PTemplateWithExercises = PTemplate & { exercises: PTemplateExerciseWithExercise[] }
type PProgramFull = PProgram & { templates: PTemplateWithExercises[] }
type PWorkoutLogWithSets = PWorkoutLog & { sets: PSetLog[] }

export function mapExercise(e: PExercise): Exercise {
  return {
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroup as Exercise['muscleGroup'],
    equipment: e.equipment,
    videoUrl: e.videoUrl ?? undefined,
    description: e.description ?? undefined,
    imageUrl: e.imageUrl ?? undefined,
    createdAt: e.createdAt,
  }
}

export function mapTemplateExercise(te: PTemplateExerciseWithExercise): WorkoutTemplateExercise {
  return {
    id: te.id,
    exerciseId: te.exerciseId,
    exercise: mapExercise(te.exercise),
    order: te.order,
    targetSets: te.targetSets,
    targetVolume: te.targetVolume as TargetVolume,
    restSeconds: te.restSeconds,
    plannedWeight: te.plannedWeight ?? undefined,
  }
}

export function mapTemplate(t: PTemplateWithExercises): WorkoutTemplate {
  return {
    id: t.id,
    programId: t.programId,
    order: t.order,
    name: t.name,
    exercises: t.exercises
      .sort((a, b) => a.order - b.order)
      .map(mapTemplateExercise),
  }
}

export function mapProgram(p: PProgramFull): Program {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    daysPerWeek: p.daysPerWeek,
    cycleLength: p.cycleLength,
    isActive: p.isActive,
    shareId: p.shareId ?? undefined,
    createdAt: p.createdAt,
    templates: p.templates
      .sort((a, b) => a.order - b.order)
      .map(mapTemplate),
  }
}

export function mapSetLog(s: PSetLog): SetLog {
  return {
    id: s.id,
    workoutLogId: s.workoutLogId,
    exerciseId: s.exerciseId,
    templateExerciseId: s.templateExerciseId,
    setNumber: s.setNumber,
    weight: s.weight,
    reps: s.reps,
    completedAt: s.completedAt,
  }
}

export function mapWorkoutLog(l: PWorkoutLogWithSets): WorkoutLog {
  return {
    id: l.id,
    userId: l.userId,
    programId: l.programId,
    workoutTemplateId: l.workoutTemplateId,
    dayIndex: l.dayIndex,
    startedAt: l.startedAt,
    finishedAt: l.finishedAt ?? undefined,
    isCompleted: l.isCompleted,
    sets: l.sets.sort((a, b) => a.setNumber - b.setNumber).map(mapSetLog),
  }
}

export function mapUser(u: PUser): User {
  return {
    id: u.id,
    firstName: u.firstName,
    username: u.username ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
  }
}

export function mapUserProgramState(s: PUserProgramState): UserProgramState {
  return {
    userId: s.userId,
    programId: s.programId,
    currentDayIndex: s.currentDayIndex,
  }
}

// Prisma include selectors (reused across routes)
export const templateInclude = {
  exercises: {
    orderBy: { order: 'asc' as const },
    include: { exercise: true },
  },
} as const

export const programInclude = {
  templates: {
    orderBy: { order: 'asc' as const },
    include: templateInclude,
  },
} as const
