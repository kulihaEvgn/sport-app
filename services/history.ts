import type { SetLog, WorkoutLog } from '@/types'
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

// ─────────────────────────────────────────────────────────────────
// Pure selectors over already-loaded history (no network).
// The full history is fetched once via getWorkoutHistory (cached in
// TanStack Query); these derive per-exercise data on the client so we
// never re-download the whole history per exercise.
// History is expected ordered by startedAt desc (freshest first).
// ─────────────────────────────────────────────────────────────────

export function selectLastNExerciseSessions(
  logs: WorkoutLog[],
  exerciseId: string,
  n: number,
): SetLog[][] {
  const sessions: SetLog[][] = []
  for (const log of logs) {
    if (sessions.length >= n) break
    if (!log.isCompleted) continue
    const sets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) sessions.push(sets)
  }
  return sessions
}

export function selectLastExerciseSets(logs: WorkoutLog[], exerciseId: string): SetLog[] {
  for (const log of logs) {
    if (!log.isCompleted) continue
    const sets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) return sets
  }
  return []
}
