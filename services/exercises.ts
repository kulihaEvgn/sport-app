import type { Exercise, MuscleGroup } from '@/types'
import { MOCK_EXERCISES } from '@/data/mock'

let exercises = [...MOCK_EXERCISES]

export type CreateExerciseInput = {
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  videoUrl?: string
  description?: string
}

export async function getExercises(): Promise<Exercise[]> {
  return exercises
}

export async function getExercise(id: string): Promise<Exercise | null> {
  return exercises.find(e => e.id === id) ?? null
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const exercise: Exercise = {
    id: `ex-${Date.now()}`,
    ...input,
    createdAt: new Date(),
  }
  exercises = [exercise, ...exercises]
  return exercise
}

export async function updateExercise(
  id: string,
  input: Partial<CreateExerciseInput>,
): Promise<Exercise> {
  exercises = exercises.map(e => e.id === id ? { ...e, ...input } : e)
  return exercises.find(e => e.id === id)!
}

export async function deleteExercise(id: string): Promise<void> {
  exercises = exercises.filter(e => e.id !== id)
}
