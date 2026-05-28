'use client'

import { useRouter } from 'next/navigation'
import { createExercise, type CreateExerciseInput } from '@/services/exercises'
import ExerciseForm from '@/components/screens/library/exercise-form'

export default function NewExercisePage() {
  const router = useRouter()

  async function handleSave(input: CreateExerciseInput) {
    await createExercise(input)
    router.push('/library/exercises')
  }

  return <ExerciseForm onSave={handleSave} onClose={() => router.back()} />
}
