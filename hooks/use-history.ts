import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkoutHistory, getWorkoutLog, saveWorkoutLog } from '@/services/history'
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
