import type { WorkoutLog } from '@/types'
import { MOCK_WORKOUT_LOGS } from '@/data/mock'

let workoutLogs = [...MOCK_WORKOUT_LOGS]

export async function getWorkoutHistory(userId: string): Promise<WorkoutLog[]> {
  return workoutLogs
    .filter(l => l.userId === userId)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
}

export async function getWorkoutLog(id: string): Promise<WorkoutLog | null> {
  return workoutLogs.find(l => l.id === id) ?? null
}

export async function saveWorkoutLog(log: WorkoutLog): Promise<WorkoutLog> {
  const existing = workoutLogs.findIndex(l => l.id === log.id)
  if (existing >= 0) {
    workoutLogs[existing] = log
  } else {
    workoutLogs = [log, ...workoutLogs]
  }
  return log
}

export async function getLastNExerciseSessions(
  userId: string,
  exerciseId: string,
  n: number,
): Promise<import('@/types').SetLog[][]> {
  const logs = workoutLogs
    .filter(l => l.userId === userId && l.isCompleted)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

  const sessions: import('@/types').SetLog[][] = []
  for (const log of logs) {
    if (sessions.length >= n) break
    const sets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) sessions.push(sets)
  }
  return sessions
}

// Returns sets from the most recent completed workout that included the given exercise.
export async function getLastExerciseSets(userId: string, exerciseId: string): Promise<import('@/types').SetLog[]> {
  const logs = workoutLogs
    .filter(l => l.userId === userId && l.isCompleted)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

  for (const log of logs) {
    const sets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) return sets
  }
  return []
}
