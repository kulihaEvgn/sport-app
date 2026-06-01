'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CheckCircle2, ChevronRight, Dumbbell } from 'lucide-react'
import { usePrograms } from '@/hooks/use-programs'
import AddLibrarySheet from '@/components/screens/library/add-library-sheet'
import AIProgramSheet from '@/components/screens/library/ai-program-sheet'

export default function ProgramsPage() {
  const router = useRouter()
  const { data: programs = [] } = usePrograms()
  const [showAddSheet, setShowAddSheet]  = React.useState(false)
  const [showAISheet, setShowAISheet]    = React.useState(false)

  return (
    <div className="flex flex-col px-4 pt-4 gap-3">
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Dumbbell size={48} color="var(--color-app-card-border)" />
          <p className="text-[14px]" style={{ color: 'var(--color-app-muted)' }}>Нет программ</p>
        </div>
      ) : (
        programs.map(program => (
          <button
            key={program.id}
            onClick={() => router.push(`/library/programs/${program.id}`)}
            className="w-full text-left rounded-2xl px-4 py-4 flex items-center gap-3 transition-all active:opacity-80"
            style={{
              background: program.isActive ? 'var(--color-app-accent-subtle)' : 'var(--color-app-card)',
              border: `1px solid ${program.isActive ? 'var(--color-app-accent-border-3)' : 'var(--color-app-card-border)'}`,
              cursor: 'pointer',
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold truncate" style={{ color: 'var(--color-app-text)' }}>
                  {program.name}
                </span>
                {program.isActive && (
                  <CheckCircle2 size={14} color="var(--color-app-accent)" className="flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
                  {program.daysPerWeek} дн/нед
                </span>
                <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
                  {program.templates.length} тренировок
                </span>
              </div>
              {program.description && (
                <p className="text-[12px] mt-1.5 truncate" style={{ color: 'var(--color-app-muted)' }}>
                  {program.description}
                </p>
              )}
            </div>
            <ChevronRight size={16} color="var(--color-app-muted)" />
          </button>
        ))
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed flex items-center justify-center rounded-full"
        style={{
          bottom: 88, right: 20,
          width: 52, height: 52,
          background: 'var(--color-app-accent)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 4px 24px rgba(74,222,128,0.4)',
        }}
      >
        <Plus size={24} color="var(--color-app-on-accent)" strokeWidth={2.5} />
      </button>

      <AddLibrarySheet
        open={showAddSheet}
        context="programs"
        onClose={() => setShowAddSheet(false)}
        onCreate={() => { setShowAddSheet(false); router.push('/library/programs/new') }}
        onGenerate={() => setShowAISheet(true)}
      />
      <AIProgramSheet open={showAISheet} onClose={() => setShowAISheet(false)} />

      {/* Invisible spacer for FAB */}
      <div className="h-20" />
    </div>
  )
}
