'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Program } from '@/types'
import { getActiveProgram } from '@/services/programs'
import { MOCK_USER } from '@/data/mock'
import { useWorkoutStore } from '@/store/workout-store'
import NoProgramView from '@/components/screens/workout/no-program-view'
import ProgramOverview from '@/components/screens/workout/program-overview'

export default function WorkoutPage() {
  const router = useRouter()
  const { activeWorkout, template } = useWorkoutStore()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Resume active workout if navigated back mid-session
    if (activeWorkout && template) {
      router.replace(`/workout/${template.id}/session`)
      return
    }
    getActiveProgram().then(p => {
      setProgram(p)
      setLoading(false)
    })
  }, []) // run once on mount

  if (loading) return null

  if (!program) {
    return <NoProgramView onGoToLibrary={() => router.push('/library/programs')} />
  }

  return (
    <ProgramOverview
      program={program}
      currentDayIndex={0}
      onStartDay={t => router.push(`/workout/${t.id}`)}
      onChangeProgram={() => router.push('/library/programs')}
    />
  )
}
