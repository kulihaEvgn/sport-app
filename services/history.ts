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
