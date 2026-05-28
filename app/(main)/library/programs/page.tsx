'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CheckCircle2, ChevronRight, Dumbbell } from 'lucide-react'
import type { Program } from '@/types'
import { getPrograms, setActiveProgram, createProgram } from '@/services/programs'

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms]   = useState<Program[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName]     = useState('')
  const [creating, setCreating]   = useState(false)

  useEffect(() => {
    getPrograms().then(setPrograms)
  }, [])

  async function handleSetActive(id: string) {
    await setActiveProgram(id)
    setPrograms(prev => prev.map(p => ({ ...p, isActive: p.id === id })))
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const p = await createProgram({ name: newName.trim(), daysPerWeek: 3 })
    setPrograms(prev => [p, ...prev])
    setNewName('')
    setShowCreate(false)
    setCreating(false)
  }

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
        onClick={() => setShowCreate(true)}
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

      {/* Create bottom sheet */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full px-4 pb-8 pt-4 rounded-t-3xl flex flex-col gap-3"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ background: '#2d2d4e' }} />
            <h3 className="text-[16px] font-bold" style={{ color: '#f9fafb' }}>Новая программа</h3>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Full Body / Месяц 1"
              className="px-3 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: '#16213e', border: '1px solid #2d2d4e', color: '#f9fafb', fontFamily: 'inherit' }}
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="w-full h-12 rounded-2xl font-bold text-[15px]"
              style={{
                background: newName.trim() ? '#4ade80' : '#2d2d4e',
                color: newName.trim() ? '#0f172a' : '#6b7280',
                border: 'none',
                cursor: newName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Создать
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
