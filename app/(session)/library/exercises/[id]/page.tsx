'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useExercise } from '@/hooks/use-exercises'
import ExerciseDetail from '@/components/screens/library/exercise-detail'
import { PageLoader } from '@/components/ui/loader'

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const { data: exercise, isLoading } = useExercise(id)

  if (isLoading) return <PageLoader />
  if (!exercise) return null

  return (
    <ExerciseDetail
      exercise={exercise}
      onBack={() => router.back()}
      onEdit={ex => router.push(`/library/exercises/${ex.id}/edit`)}
      onDeleted={() => router.push('/library/exercises')}
    />
  )
}
