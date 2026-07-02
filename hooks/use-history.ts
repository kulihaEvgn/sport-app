import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWorkoutHistory,
  getWorkoutLog,
  saveWorkoutLog,
  selectLastExerciseSets,
  selectLastNExerciseSessions,
} from '@/services/history'
import type { WorkoutLog } from '@/types'

export const historyKeys = {
  all:    (userId: string) => ['history', userId] as const,
  detail: (id: string)     => ['history', 'log', id] as const,
}

export function useWorkoutHistory(userId: string) {
  return useQuery({
    queryKey: historyKeys.all(userId),
    queryFn:  () => getWorkoutHistory(userId),
    enabled:  Boolean(userId),
  })
}

export function useWorkoutLog(id: string) {
  return useQuery({
    queryKey: historyKeys.detail(id),
    queryFn:  () => getWorkoutLog(id),
    enabled:  Boolean(id),
  })
}

// Both per-exercise hooks subscribe to the SAME cached history query
// (historyKeys.all(userId)) and derive their slice via `select`. React
// Query dedups by queryKey, so the whole history is fetched once and
// reused for every exercise instead of one full download per exercise.

export function useLastExerciseSets(userId: string, exerciseId: string) {
  return useQuery({
    queryKey: historyKeys.all(userId),
    queryFn:  () => getWorkoutHistory(userId),
    enabled:  Boolean(userId) && Boolean(exerciseId),
    select:   (logs: WorkoutLog[]) => selectLastExerciseSets(logs, exerciseId),
  })
}

export function useLastNExerciseSessions(userId: string, exerciseId: string, n: number) {
  return useQuery({
    queryKey: historyKeys.all(userId),
    queryFn:  () => getWorkoutHistory(userId),
    enabled:  Boolean(userId) && Boolean(exerciseId),
    select:   (logs: WorkoutLog[]) => selectLastNExerciseSessions(logs, exerciseId, n),
  })
}

export function useSaveWorkoutLog(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (log: WorkoutLog) => saveWorkoutLog(log),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: historyKeys.all(userId) })
      qc.invalidateQueries({ queryKey: historyKeys.detail(saved.id) })
    },
  })
}
