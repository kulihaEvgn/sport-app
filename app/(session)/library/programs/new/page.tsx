'use client'

import { useRouter } from 'next/navigation'
import ProgramForm from '@/components/screens/library/program-form'
import { useCreateProgram } from '@/hooks/use-programs'
import type { ProgramInput } from '@/schemas/program'

export default function NewProgramPage() {
  const router = useRouter()
  const { mutateAsync: createProgram } = useCreateProgram()

  async function handleSave(input: ProgramInput) {
    await createProgram(input)
    router.back()
  }

  return <ProgramForm onSave={handleSave} onClose={() => router.back()} />
}
