'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import ProgramForm from '@/components/screens/library/program-form'
import { useProgram, useUpdateProgram } from '@/hooks/use-programs'
import type { ProgramInput } from '@/schemas/program'

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const { data: program } = useProgram(id)
  const { mutateAsync: updateProgram } = useUpdateProgram()

  async function handleSave(input: ProgramInput) {
    await updateProgram({ id, input })
    router.back()
  }

  if (!program) return null

  return <ProgramForm initial={program} onSave={handleSave} onClose={() => router.back()} />
}
