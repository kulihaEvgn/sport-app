'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutLog } from '@/hooks/use-history'
import WorkoutSummary from '@/components/screens/workout/workout-summary'
import { PageLoader } from '@/components/ui/loader'

export default function WorkoutSummaryPage({ params }: { params: Promise<{ logId: string }> }) {
  const { logId } = use(params)
  const router    = useRouter()
  const { data: log, isLoading } = useWorkoutLog(logId)

  if (isLoading) return <PageLoader />
  if (!log) return null

  return (
    <WorkoutSummary
      log={log}
      onClose={() => router.push('/workout')}
    />
  )
}
