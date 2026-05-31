'use client'

import { useRouter } from 'next/navigation'
import { useCreateExercise } from '@/hooks/use-exercises'
import ExerciseForm from '@/components/screens/library/exercise-form'
import type { CreateExerciseInput } from '@/services/exercises'

export default function NewExercisePage() {
  const router = useRouter()
  const { mutateAsync: createExercise } = useCreateExercise()

  async function handleSave(input: CreateExerciseInput) {
    await createExercise(input)
    router.push('/library/exercises')
  }

  return <ExerciseForm onSave={handleSave} onClose={() => router.back()} />
}
