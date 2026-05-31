'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutLog } from '@/hooks/use-history'
import WorkoutSummary from '@/components/screens/workout/workout-summary'

export default function WorkoutSummaryPage({ params }: { params: Promise<{ logId: string }> }) {
  const { logId } = use(params)
  const router    = useRouter()
  const { data: log } = useWorkoutLog(logId)

  if (!log) return null

  return (
    <WorkoutSummary
      log={log}
      onClose={() => router.push('/workout')}
    />
  )
}
