'use client'

import { create } from 'zustand'
import type { WorkoutLog, WorkoutTemplate, SetLog } from '@/types'

interface WorkoutStore {
  activeWorkout: WorkoutLog | null
  template: WorkoutTemplate | null
  currentExerciseIndex: number
  restTimerSeconds: number
  isRestTimerActive: boolean
  viewMode: 'list' | 'cards'
  workoutStartTime: number | null
  lastCompletedLog: WorkoutLog | null

  startWorkout: (template: WorkoutTemplate, userId: string) => void
  logSet: (set: Omit<SetLog, 'id' | 'workoutLogId'>) => void
  nextExercise: () => void
  prevExercise: () => void
  skipExercise: () => void
  startRestTimer: (seconds: number) => void
  stopRestTimer: () => void
  tickTimer: () => void
  finishWorkout: () => WorkoutLog | null
  discardWorkout: () => void
  setViewMode: (mode: 'list' | 'cards') => void
  clearLastCompleted: () => void
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeWorkout: null,
  template: null,
  currentExerciseIndex: 0,
  restTimerSeconds: 0,
  isRestTimerActive: false,
  viewMode: 'cards',
  workoutStartTime: null,
  lastCompletedLog: null,

  startWorkout: (template, userId) => {
    const workout: WorkoutLog = {
      id: `wlog-${Date.now()}`,
      userId,
      programId: template.programId,
      workoutTemplateId: template.id,
      dayIndex: template.order,
      startedAt: new Date(),
      isCompleted: false,
      sets: [],
    }
    set({
      activeWorkout: workout,
      template,
      currentExerciseIndex: 0,
      restTimerSeconds: 0,
      isRestTimerActive: false,
      workoutStartTime: Date.now(),
    })
  },

  logSet: (setData) => {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    const newSet: SetLog = {
      id: `set-${Date.now()}-${Math.random()}`,
      workoutLogId: activeWorkout.id,
      ...setData,
    }
    set({
      activeWorkout: {
        ...activeWorkout,
        sets: [...activeWorkout.sets, newSet],
      },
    })
  },

  nextExercise: () => {
    const { currentExerciseIndex, template } = get()
    if (!template) return
    const max = template.exercises.length - 1
    set({ currentExerciseIndex: Math.min(currentExerciseIndex + 1, max) })
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get()
    set({ currentExerciseIndex: Math.max(currentExerciseIndex - 1, 0) })
  },

  skipExercise: () => {
    get().nextExercise()
  },

  startRestTimer: (seconds) => {
    set({ restTimerSeconds: seconds, isRestTimerActive: true })
  },

  stopRestTimer: () => {
    set({ restTimerSeconds: 0, isRestTimerActive: false })
  },

  tickTimer: () => {
    const { restTimerSeconds } = get()
    if (restTimerSeconds <= 1) {
      set({ restTimerSeconds: 0, isRestTimerActive: false })
    } else {
      set({ restTimerSeconds: restTimerSeconds - 1 })
    }
  },

  finishWorkout: () => {
    const { activeWorkout } = get()
    if (!activeWorkout) return null
    const finished: WorkoutLog = {
      ...activeWorkout,
      finishedAt: new Date(),
      isCompleted: true,
    }
    set({
      activeWorkout: null,
      template: null,
      currentExerciseIndex: 0,
      restTimerSeconds: 0,
      isRestTimerActive: false,
      workoutStartTime: null,
      lastCompletedLog: finished,
    })
    return finished
  },

  discardWorkout: () => {
    set({
      activeWorkout: null,
      template: null,
      currentExerciseIndex: 0,
      restTimerSeconds: 0,
      isRestTimerActive: false,
      workoutStartTime: null,
    })
  },

  clearLastCompleted: () => set({ lastCompletedLog: null }),

  setViewMode: (mode) => set({ viewMode: mode }),
}))
