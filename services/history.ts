import type { WorkoutLog } from '@/types'
import { apiFetch } from '@/lib/api-client'

export async function getWorkoutHistory(userId: string): Promise<WorkoutLog[]> {
  void userId
  return apiFetch<WorkoutLog[]>('/api/history')
}

export async function getWorkoutLog(id: string): Promise<WorkoutLog | null> {
  try {
    return await apiFetch<WorkoutLog>(`/api/history/${id}`)
  } catch {
    return null
  }
}

export async function saveWorkoutLog(log: WorkoutLog): Promise<WorkoutLog> {
  return apiFetch<WorkoutLog>('/api/history', { method: 'POST', body: JSON.stringify(log) })
}

export async function getLastNExerciseSessions(
  userId: string,
  exerciseId: string,
  n: number,
): Promise<import('@/types').SetLog[][]> {
  const logs = await getWorkoutHistory(userId)
  const completed = logs.filter(l => l.isCompleted)

  const sessions: import('@/types').SetLog[][] = []
  for (const log of completed) {
    if (sessions.length >= n) break
    const sets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) sessions.push(sets)
  }
  return sessions
}

export async function getLastExerciseSets(userId: string, exerciseId: string): Promise<import('@/types').SetLog[]> {
  const logs = await getWorkoutHistory(userId)
  const completed = logs.filter(l => l.isCompleted)
  for (const log of completed) {
    const sets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) return sets
  }
  return []
}
