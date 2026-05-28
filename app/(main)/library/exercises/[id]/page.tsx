'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/types'
import { getExercise } from '@/services/exercises'
import ExerciseDetail from '@/components/screens/library/exercise-detail'

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [exercise, setExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    getExercise(id).then(setExercise)
  }, [id])

  if (!exercise) return null

  return (
    <ExerciseDetail
      exercise={exercise}
      onBack={() => router.push('/library/exercises')}
      onEdit={ex => router.push(`/library/exercises/${ex.id}/edit`)}
      onDeleted={() => router.push('/library/exercises')}
    />
  )
}
