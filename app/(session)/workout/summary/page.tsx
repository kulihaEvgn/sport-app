'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/workout-store'
import { useWorkoutLog } from '@/hooks/use-history'
import WorkoutSummary from '@/components/screens/workout/workout-summary'

export default function WorkoutSummaryPage() {
  const router = useRouter()
  const { lastLogId, clearLastLogId } = useWorkoutStore()
  const { data: log } = useWorkoutLog(lastLogId ?? '')

  useEffect(() => {
    if (!lastLogId) router.replace('/workout')
  }, [lastLogId, router])

  if (!lastLogId || !log) return null

  return (
    <WorkoutSummary
      log={log}
      onClose={() => {
        clearLastLogId()
        router.push('/workout')
      }}
    />
  )
}
