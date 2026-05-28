'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/workout-store'
import ActiveWorkout from '@/components/screens/workout/active-workout'

export default function WorkoutSessionPage({ params }: { params: Promise<{ templateId: string }> }) {
  use(params) // templateId available from store
  const router = useRouter()
  const { activeWorkout } = useWorkoutStore()

  useEffect(() => {
    if (!activeWorkout) router.replace('/workout')
  }, [activeWorkout, router])

  if (!activeWorkout) return null

  return (
    <ActiveWorkout
      onFinish={() => router.push('/workout/summary')}
      onDiscard={() => router.push('/workout')}
    />
  )
}
