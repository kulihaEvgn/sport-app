'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WorkoutLog, WorkoutTemplate, SetLog } from '@/types'
import { saveWorkoutLog } from '@/services/history'
import { advanceProgramDay } from '@/services/programs'

interface WorkoutStore {
  activeWorkout: WorkoutLog | null
  template: WorkoutTemplate | null
  currentExerciseIndex: number
  currentSetNumber: number
  workoutStartedAt: Date | null
  restEndsAt: Date | null
  viewMode: 'list' | 'cards'
  logStatus: 'idle' | 'saving' | 'error'
  // Временный мост до Фазы 3: хранит logId завершённой тренировки для summary
  lastLogId: string | null

  startWorkout: (template: WorkoutTemplate, userId: string) => void
  logSet: (set: Omit<SetLog, 'id' | 'workoutLogId'>) => void
  nextExercise: () => void
  prevExercise: () => void
  skipExercise: () => void
  startRest: (seconds: number) => void
  stopRest: () => void
  finishWorkout: () => Promise<boolean>
  discardWorkout: () => void
  setViewMode: (mode: 'list' | 'cards') => void
  clearLastLogId: () => void
  restoreSession: () => void
}

const EMPTY_STATE = {
  activeWorkout: null,
  template: null,
  currentExerciseIndex: 0,
  currentSetNumber: 1,
  workoutStartedAt: null,
  restEndsAt: null,
  logStatus: 'idle' as const,
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_STATE,
      viewMode: 'cards',
      lastLogId: null,

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
          ...EMPTY_STATE,
          activeWorkout: workout,
          template,
          workoutStartedAt: new Date(),
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
          activeWorkout: { ...activeWorkout, sets: [...activeWorkout.sets, newSet] },
          currentSetNumber: get().currentSetNumber + 1,
        })
      },

      nextExercise: () => {
        const { currentExerciseIndex, template } = get()
        if (!template) return
        set({
          currentExerciseIndex: Math.min(currentExerciseIndex + 1, template.exercises.length - 1),
          currentSetNumber: 1,
          restEndsAt: null,
        })
      },

      prevExercise: () => {
        const { currentExerciseIndex } = get()
        set({
          currentExerciseIndex: Math.max(currentExerciseIndex - 1, 0),
          currentSetNumber: 1,
          restEndsAt: null,
        })
      },

      skipExercise: () => get().nextExercise(),

      startRest: (seconds) => {
        set({ restEndsAt: new Date(Date.now() + seconds * 1000) })
      },

      stopRest: () => set({ restEndsAt: null }),

      finishWorkout: async () => {
        const { activeWorkout } = get()
        if (!activeWorkout) return false

        set({ logStatus: 'saving' })
        const finished: WorkoutLog = {
          ...activeWorkout,
          finishedAt: new Date(),
          isCompleted: true,
        }

        try {
          await saveWorkoutLog(finished)
          // Двигаем указатель от фактически завершённого дня (finished.dayIndex),
          // а не «слепым» +1 от текущего указателя.
          await advanceProgramDay(finished.dayIndex)
          set({ ...EMPTY_STATE, lastLogId: finished.id })
          return true
        } catch {
          set({ logStatus: 'error' })
          return false
        }
      },

      discardWorkout: () => set(EMPTY_STATE),

      setViewMode: (mode) => set({ viewMode: mode }),

      clearLastLogId: () => set({ lastLogId: null }),

      restoreSession: () => {
        // Сессия восстанавливается автоматически через persist.
        // Метод для явного вызова при маунте — можно добавить логику позже.
      },
    }),
    {
      name: 'workout-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeWorkout: state.activeWorkout,
        template: state.template,
        currentExerciseIndex: state.currentExerciseIndex,
        currentSetNumber: state.currentSetNumber,
        workoutStartedAt: state.workoutStartedAt,
        viewMode: state.viewMode,
        lastLogId: state.lastLogId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.activeWorkout) {
          state.activeWorkout.startedAt = new Date(state.activeWorkout.startedAt)
          if (state.activeWorkout.finishedAt) {
            state.activeWorkout.finishedAt = new Date(state.activeWorkout.finishedAt)
          }
          state.activeWorkout.sets = state.activeWorkout.sets.map(s => ({
            ...s,
            completedAt: new Date(s.completedAt),
          }))
        }
        if (state.workoutStartedAt) {
          state.workoutStartedAt = new Date(state.workoutStartedAt as unknown as string)
        }
        // restEndsAt не персистируем — таймер отдыха не переживает сворачивание
      },
    },
  ),
)
