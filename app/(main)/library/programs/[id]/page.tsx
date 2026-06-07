'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import ProgramDetail from '@/components/screens/library/program-detail'
import { useProgram } from '@/hooks/use-programs'
import { PageLoader } from '@/components/ui/loader'

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const { data: program, isLoading } = useProgram(id)

  if (isLoading) return <PageLoader />
  if (!program)  return null

  return (
    <ProgramDetail
      program={program}
      onBack={() => router.push('/library/programs')}
      onEdit={() => router.push(`/library/programs/${id}/edit`)}
      onEditDay={(templateId) => router.push(`/library/programs/${id}/days/${templateId}`)}
      onDeleted={() => router.push('/library/programs')}
    />
  )
}
