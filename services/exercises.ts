import type { Exercise, MuscleGroup } from '@/types'
import { apiFetch } from '@/lib/api-client'

export type CreateExerciseInput = {
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  videoUrl?: string
  description?: string
  imageUrl?: string
}

export async function getExercises(): Promise<Exercise[]> {
  return apiFetch<Exercise[]>('/api/exercises')
}

export async function getExercise(id: string): Promise<Exercise | null> {
  try {
    return await apiFetch<Exercise>(`/api/exercises/${id}`)
  } catch {
    return null
  }
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  return apiFetch<Exercise>('/api/exercises', { method: 'POST', body: JSON.stringify(input) })
}

export async function updateExercise(id: string, input: Partial<CreateExerciseInput>): Promise<Exercise> {
  return apiFetch<Exercise>(`/api/exercises/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteExercise(id: string): Promise<void> {
  await apiFetch<void>(`/api/exercises/${id}`, { method: 'DELETE' })
}
