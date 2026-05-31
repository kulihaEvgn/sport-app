'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutTemplate } from '@/types'
import { getTemplateById } from '@/services/programs'
import { MOCK_USER } from '@/data/mock'
import { useWorkoutStore } from '@/store/workout-store'
import DayPreview from '@/components/screens/workout/day-preview'

export default function DayPreviewPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = use(params)
  const router = useRouter()
  const { startWorkout } = useWorkoutStore()
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null)

  useEffect(() => {
    getTemplateById(templateId).then(t => {
      if (!t) router.replace('/workout')
      else setTemplate(t)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  if (!template) return null

  return (
    <DayPreview
      template={template}
      onBack={() => router.back()}
      onStart={() => {
        startWorkout(template, MOCK_USER.id)
        router.push(`/workout/${templateId}/session`)
      }}
    />
  )
}
