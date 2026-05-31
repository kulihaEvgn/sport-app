'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useExercise, useDeleteExercise } from '@/hooks/use-exercises'
import ExerciseDetail from '@/components/screens/library/exercise-detail'

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const { data: exercise } = useExercise(id)
  const { mutateAsync: deleteExercise } = useDeleteExercise()

  if (!exercise) return null

  return (
    <ExerciseDetail
      exercise={exercise}
      onBack={() => router.push('/library/exercises')}
      onEdit={ex => router.push(`/library/exercises/${ex.id}/edit`)}
      onDeleted={async () => {
        await deleteExercise(exercise.id)
        router.push('/library/exercises')
      }}
    />
  )
}
