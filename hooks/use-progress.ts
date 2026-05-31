import { useQuery } from '@tanstack/react-query'
import { getExerciseProgress, getStreak, getMonthStats, getFavoriteMuscleGroup } from '@/services/progress'
import { getExercises } from '@/services/exercises'

export const progressKeys = {
  exerciseProgress: (userId: string, exerciseId: string, periodDays: number) =>
    ['progress', 'exercise', userId, exerciseId, periodDays] as const,
  streak:     (userId: string) => ['progress', 'streak', userId] as const,
  monthStats: (userId: string) => ['progress', 'month', userId] as const,
  favorite:   (userId: string) => ['progress', 'favorite', userId] as const,
}

export function useExerciseProgress(userId: string, exerciseId: string, periodDays = 90) {
  return useQuery({
    queryKey: progressKeys.exerciseProgress(userId, exerciseId, periodDays),
    queryFn:  () => getExerciseProgress(userId, exerciseId, periodDays),
    enabled:  Boolean(userId) && Boolean(exerciseId),
  })
}

export function useStreak(userId: string) {
  return useQuery({
    queryKey: progressKeys.streak(userId),
    queryFn:  () => getStreak(userId),
    enabled:  Boolean(userId),
  })
}

export function useMonthStats(userId: string) {
  return useQuery({
    queryKey: progressKeys.monthStats(userId),
    queryFn:  () => getMonthStats(userId),
    enabled:  Boolean(userId),
  })
}

export function useFavoriteMuscleGroup(userId: string) {
  return useQuery({
    queryKey: progressKeys.favorite(userId),
    queryFn:  async () => {
      const exercises = await getExercises()
      return getFavoriteMuscleGroup(userId, exercises)
    },
    enabled: Boolean(userId),
  })
}
