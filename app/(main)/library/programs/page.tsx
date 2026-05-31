'use client'

import { useRouter } from 'next/navigation'
import { Plus, CheckCircle2, ChevronRight, Dumbbell } from 'lucide-react'
import { usePrograms } from '@/hooks/use-programs'

export default function ProgramsPage() {
  const router = useRouter()
  const { data: programs = [] } = usePrograms()

  return (
    <div className="flex flex-col px-4 pt-4 gap-3">
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Dumbbell size={48} color="#2d2d4e" />
          <p className="text-[14px]" style={{ color: '#6b7280' }}>Нет программ</p>
        </div>
      ) : (
        programs.map(program => (
          <button
            key={program.id}
            onClick={() => router.push(`/library/programs/${program.id}`)}
            className="w-full text-left rounded-2xl px-4 py-4 flex items-center gap-3 transition-all active:opacity-80"
            style={{
              background: program.isActive ? 'rgba(74,222,128,0.08)' : '#1a1a2e',
              border: `1px solid ${program.isActive ? 'rgba(74,222,128,0.4)' : '#2d2d4e'}`,
              cursor: 'pointer',
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold truncate" style={{ color: '#f9fafb' }}>
                  {program.name}
                </span>
                {program.isActive && (
                  <CheckCircle2 size={14} color="#4ade80" className="flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[12px]" style={{ color: '#6b7280' }}>
                  {program.daysPerWeek} дн/нед
                </span>
                <span className="text-[12px]" style={{ color: '#6b7280' }}>
                  {program.templates.length} тренировок
                </span>
              </div>
              {program.description && (
                <p className="text-[12px] mt-1.5 truncate" style={{ color: '#6b7280' }}>
                  {program.description}
                </p>
              )}
            </div>
            <ChevronRight size={16} color="#6b7280" />
          </button>
        ))
      )}

      {/* FAB */}
      <button
        onClick={() => router.push('/library/programs/new')}
        className="fixed flex items-center justify-center rounded-full"
        style={{
          bottom: 88, right: 20,
          width: 52, height: 52,
          background: '#4ade80',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 4px 24px rgba(74,222,128,0.4)',
        }}
      >
        <Plus size={24} color="#0f172a" strokeWidth={2.5} />
      </button>

      {/* Invisible spacer for FAB */}
      <div className="h-20" />
    </div>
  )
}
