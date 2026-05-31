'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useExercise, useUpdateExercise } from '@/hooks/use-exercises'
import ExerciseForm from '@/components/screens/library/exercise-form'
import type { CreateExerciseInput } from '@/services/exercises'

export default function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params)
  const router   = useRouter()
  const { data: exercise }          = useExercise(id)
  const { mutateAsync: updateExercise } = useUpdateExercise()

  if (!exercise) return null

  async function handleSave(input: CreateExerciseInput) {
    await updateExercise({ id, input })
    router.push(`/library/exercises/${id}`)
  }

  return <ExerciseForm initial={exercise} onSave={handleSave} onClose={() => router.back()} />
}
