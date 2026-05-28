'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Program } from '@/types'
import { getProgram, setActiveProgram } from '@/services/programs'
import ProgramDetail from '@/components/screens/library/program-detail'

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [program, setProgram] = useState<Program | null>(null)

  useEffect(() => {
    getProgram(id).then(setProgram)
  }, [id])

  async function handleSetActive(programId: string) {
    await setActiveProgram(programId)
    setProgram(prev => prev ? { ...prev, isActive: true } : null)
  }

  if (!program) return null

  return (
    <ProgramDetail
      program={program}
      onBack={() => router.push('/library/programs')}
      onSetActive={handleSetActive}
    />
  )
}
