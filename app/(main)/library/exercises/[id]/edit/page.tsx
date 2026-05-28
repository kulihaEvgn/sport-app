'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/types'
import { getExercise, updateExercise, type CreateExerciseInput } from '@/services/exercises'
import ExerciseForm from '@/components/screens/library/exercise-form'

export default function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [exercise, setExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    getExercise(id).then(setExercise)
  }, [id])

  async function handleSave(input: CreateExerciseInput) {
    await updateExercise(id, input)
    router.push(`/library/exercises/${id}`)
  }

  if (!exercise) return null

  return <ExerciseForm initial={exercise} onSave={handleSave} onClose={() => router.back()} />
}
