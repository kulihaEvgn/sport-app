'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/workout-store'
import { useTemplate } from '@/hooks/use-programs'
import { useUser } from '@/hooks/use-user'
import DayPreview from '@/components/screens/workout/day-preview'

export default function DayPreviewPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = use(params)
  const router = useRouter()
  const { startWorkout } = useWorkoutStore()
  const { data: user } = useUser()

  const { data: template, isLoading } = useTemplate(templateId)

  if (isLoading) return null
  if (!template) {
    router.replace('/workout')
    return null
  }

  return (
    <DayPreview
      template={template}
      onBack={() => router.back()}
      onStart={() => {
        startWorkout(template, user?.id ?? '')
        router.push(`/workout/${templateId}/session`)
      }}
    />
  )
}
