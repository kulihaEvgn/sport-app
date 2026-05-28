import type { WorkoutLog, SetLog, MuscleGroup, Exercise } from '@/types'
import { getWorkoutHistory } from './history'

export interface ExerciseProgressPoint {
  date: Date
  weight: number
  reps: number
  volume: number
}

export interface StreakInfo {
  current: number
  best: number
}

export interface MonthStats {
  totalWorkouts: number
  totalVolume: number
  totalSets: number
}

export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  periodDays = 90,
): Promise<ExerciseProgressPoint[]> {
  const history = await getWorkoutHistory(userId)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)

  const points: ExerciseProgressPoint[] = []

  for (const log of history) {
    if (log.startedAt < cutoff) continue
    const sets = log.sets.filter(s => s.exerciseId === exerciseId && !s.isWarmup)
    if (sets.length === 0) continue

    const maxWeightSet = sets.reduce<SetLog | null>((best, s) =>
      !best || s.weight > best.weight ? s : best, null)

    if (!maxWeightSet) continue

    points.push({
      date: log.startedAt,
      weight: maxWeightSet.weight,
      reps: maxWeightSet.reps,
      volume: sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    })
  }

  return points.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export async function getStreak(userId: string): Promise<StreakInfo> {
  const history = await getWorkoutHistory(userId)
  const completed = history.filter(l => l.isCompleted)
  if (completed.length === 0) return { current: 0, best: 0 }

  const dates = [...new Set(
    completed.map(l => l.startedAt.toDateString()),
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let current = 0
  let best = 0
  let streak = 1
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (dates[0] === today || dates[0] === yesterday) {
    current = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
      if (diff === 1) {
        current++
        streak++
      } else {
        break
      }
    }
  }

  streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diff === 1) {
      streak++
      best = Math.max(best, streak)
    } else {
      streak = 1
    }
  }

  return { current, best: Math.max(best, current) }
}

export async function getMonthStats(userId: string): Promise<MonthStats> {
  const history = await getWorkoutHistory(userId)
  const cutoff = new Date()
  cutoff.setDate(1)
  cutoff.setHours(0, 0, 0, 0)

  const monthLogs = history.filter(l => l.isCompleted && l.startedAt >= cutoff)

  return {
    totalWorkouts: monthLogs.length,
    totalSets: monthLogs.reduce((sum, l) => sum + l.sets.length, 0),
    totalVolume: monthLogs.reduce((sum, l) =>
      sum + l.sets.reduce((s2, s) => s2 + s.weight * s.reps, 0), 0),
  }
}

export async function getFavoriteMuscleGroup(
  userId: string,
  exercises: Exercise[],
): Promise<MuscleGroup | null> {
  const history = await getWorkoutHistory(userId)
  const exMap = new Map(exercises.map(e => [e.id, e]))
  const counts = new Map<MuscleGroup, number>()

  for (const log of history) {
    for (const set of log.sets) {
      const mg = exMap.get(set.exerciseId)?.muscleGroup
      if (mg) counts.set(mg, (counts.get(mg) ?? 0) + 1)
    }
  }

  if (!counts.size) return null
  return [...counts.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}
