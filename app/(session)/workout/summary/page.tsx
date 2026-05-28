'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/workout-store'
import WorkoutSummary from '@/components/screens/workout/workout-summary'

export default function WorkoutSummaryPage() {
  const router = useRouter()
  const { lastCompletedLog, clearLastCompleted } = useWorkoutStore()

  useEffect(() => {
    if (!lastCompletedLog) router.replace('/workout')
  }, [lastCompletedLog, router])

  if (!lastCompletedLog) return null

  return (
    <WorkoutSummary
      log={lastCompletedLog}
      onClose={() => {
        clearLastCompleted()
        router.push('/workout')
      }}
    />
  )
}
