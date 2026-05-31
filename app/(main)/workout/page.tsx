'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/workout-store'
import { useActiveProgram, useActiveProgramState } from '@/hooks/use-programs'
import NoProgramView from '@/components/screens/workout/no-program-view'
import ProgramOverview from '@/components/screens/workout/program-overview'

export default function WorkoutPage() {
  const router = useRouter()
  const { activeWorkout, template } = useWorkoutStore()

  const { data: program, isLoading: loadingProgram } = useActiveProgram()
  const { data: programState, isLoading: loadingState } = useActiveProgramState()

  useEffect(() => {
    if (activeWorkout && template) {
      router.replace(`/workout/${template.id}/session`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadingProgram || loadingState) return null

  if (!program) {
    return <NoProgramView onGoToLibrary={() => router.push('/library/programs')} />
  }

  const currentDayIndex = programState?.currentDayIndex ?? 0

  return (
    <ProgramOverview
      program={program}
      currentDayIndex={currentDayIndex}
      onStartDay={t => router.push(`/workout/${t.id}`)}
      onChangeProgram={() => router.push('/library/programs')}
    />
  )
}
