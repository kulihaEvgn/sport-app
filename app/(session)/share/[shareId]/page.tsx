'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Dumbbell, Calendar, ArrowLeft } from 'lucide-react'
import { useSharedProgram, useImportSharedProgram } from '@/hooks/use-programs'
import { PageLoader, Spinner } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionLabel } from '@/components/ui/section-label'
import { MuscleChip } from '@/components/ui/muscle-chip'
import type { MuscleGroup } from '@/types'

export default function SharedProgramPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params)
  const router      = useRouter()
  const { data: program, isLoading } = useSharedProgram(shareId)
  const { mutateAsync: importProgram, isPending: importing } = useImportSharedProgram()
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    setError(null)
    try {
      const imported = await importProgram(shareId)
      router.push(`/library/programs/${imported.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось импортировать')
    }
  }

  if (isLoading) return <PageLoader />
  if (!program) {
    return (
      <div className="flex flex-col h-full">
        <EmptyState
          title="Программа не найдена"
          description="Ссылка устарела или была удалена автором."
          action={
            <button
              onClick={() => router.push('/library/programs')}
              className="h-11 px-4 rounded-2xl text-[14px] font-semibold"
              style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)', color: 'var(--color-app-text)', cursor: 'pointer' }}
            >
              К моим программам
            </button>
          }
        />
      </div>
    )
  }

  const totalExercises = program.templates.reduce((s, t) => s + t.exercises.length, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-app-border)' }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-accent)' }}
        >
          <ArrowLeft size={18} color="var(--color-app-accent)" />
          Назад
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 flex flex-col gap-5 pb-32">
        {/* Hero */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-app-accent-soft)', border: '1px solid var(--color-app-accent-border-2)' }}>
            <Dumbbell size={26} color="var(--color-app-accent)" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
              ПОДЕЛИЛИСЬ ПРОГРАММОЙ
            </p>
            <h1 className="text-[22px] font-bold leading-tight mt-0.5"
              style={{ color: 'var(--color-app-text)' }}>
              {program.name}
            </h1>
          </div>
        </div>

        {program.description && (
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-app-muted-2)' }}>
            {program.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-3">
          <Stat icon={<Calendar size={16} color="var(--color-app-cyan)" />} value={`${program.daysPerWeek}`} label="дн/нед" />
          <Stat icon={<Dumbbell size={16} color="var(--color-app-accent)" />} value={`${program.cycleLength}`} label="тренировок" />
          <Stat icon={<Dumbbell size={16} color="#f59e0b" />} value={`${totalExercises}`} label="упражнений" />
        </div>

        {/* Templates preview */}
        <div className="flex flex-col gap-3">
          <SectionLabel>ДНИ ЦИКЛА</SectionLabel>
          {program.templates.map((t, i) => {
            const groups = [...new Set(t.exercises.map(e => e.muscleGroup))]
            return (
              <div key={i} className="rounded-2xl px-4 py-3 flex flex-col gap-2"
                style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold w-5"
                    style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-semibold flex-1"
                    style={{ color: 'var(--color-app-text)' }}>
                    {t.name}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>
                    {t.exercises.length} упр.
                  </span>
                </div>
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {groups.map(g => <MuscleChip key={g} muscleGroup={g as MuscleGroup} size="sm" />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pinned action */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2"
        style={{ borderTop: '1px solid var(--color-app-border)', background: 'var(--color-app-bg)' }}>
        {error && (
          <p className="text-[12px] mb-2 px-3 py-2 rounded-xl text-center"
            style={{ color: 'var(--color-app-error)', background: 'rgba(239,68,68,0.08)' }}>
            {error}
          </p>
        )}
        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full h-14 rounded-2xl text-[16px] font-bold flex items-center justify-center gap-2"
          style={{
            background: importing ? 'var(--color-app-border)' : 'var(--color-app-accent)',
            color:      importing ? 'var(--color-app-muted)' : 'var(--color-app-on-accent)',
            border: 'none',
            cursor: importing ? 'not-allowed' : 'pointer',
          }}
        >
          {importing
            ? <Spinner size={18} color="var(--color-app-muted)" />
            : <Download size={18} />
          }
          {importing ? 'Импортирую…' : 'Импортировать в библиотеку'}
        </button>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex-1 rounded-2xl px-3 py-3 flex flex-col gap-1 items-center"
      style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}>
      {icon}
      <div className="text-[20px] font-bold" style={{ color: 'var(--color-app-accent)' }}>{value}</div>
      <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>{label}</div>
    </div>
  )
}
