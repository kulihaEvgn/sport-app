'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import ProgramDetail from '@/components/screens/library/program-detail'
import { useProgram, useSetActiveProgram, useDeleteProgram } from '@/hooks/use-programs'

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const { data: program } = useProgram(id)
  const { mutateAsync: setActive }  = useSetActiveProgram()
  const { mutateAsync: deleteProgram } = useDeleteProgram()

  if (!program) return null

  return (
    <ProgramDetail
      program={program}
      onBack={() => router.push('/library/programs')}
      onSetActive={(pid) => setActive(pid)}
      onEdit={() => router.push(`/library/programs/${id}/edit`)}
      onEditDay={(templateId) => router.push(`/library/programs/${id}/days/${templateId}`)}
      onDelete={async (pid) => { await deleteProgram(pid); router.push('/library/programs') }}
    />
  )
}
