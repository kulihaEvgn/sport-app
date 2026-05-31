'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Play, Pencil, Plus, Trash2, ChevronRight } from 'lucide-react'
import type { Program, WorkoutTemplate } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'
import { useAddTemplate, useRemoveTemplate } from '@/hooks/use-programs'

interface Props {
  program: Program
  onBack: () => void
  onSetActive: (id: string) => void
  onEdit: () => void
  onEditDay: (templateId: string) => void
}

function getMuscleGroups(template: WorkoutTemplate) {
  const groups = [...new Set(template.exercises.map(te => te.exercise.muscleGroup))]
  return groups.slice(0, 3)
}

export default function ProgramDetail({ program, onBack, onSetActive, onEdit, onEditDay }: Props) {
  const [showAddDay, setShowAddDay]     = useState(false)
  const [newDayName, setNewDayName]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { mutateAsync: addTemplate, isPending: addingDay }     = useAddTemplate()
  const { mutateAsync: removeTemplate, isPending: removingDay } = useRemoveTemplate()

  async function handleAddDay() {
    if (!newDayName.trim()) return
    await addTemplate({ programId: program.id, input: { name: newDayName.trim() } })
    setNewDayName('')
    setShowAddDay(false)
  }

  async function handleDeleteDay(templateId: string) {
    await removeTemplate({ programId: program.id, templateId })
    setConfirmDelete(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80' }}
        >
          <ArrowLeft size={18} color="#4ade80" />
          Назад
        </button>
        <div className="flex items-center gap-2">
          {program.isActive ? (
            <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: '#4ade80' }}>
              <CheckCircle2 size={14} />
              Активна
            </div>
          ) : (
            <button
              onClick={() => onSetActive(program.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
              style={{
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.4)',
                color: '#4ade80',
                cursor: 'pointer',
              }}
            >
              <Play size={12} fill="#4ade80" />
              Активировать
            </button>
          )}
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', cursor: 'pointer' }}
          >
            <Pencil size={14} color="#6b7280" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Title */}
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#f9fafb' }}>{program.name}</h1>
          {program.description && (
            <p className="text-[13px] mt-1" style={{ color: '#6b7280' }}>{program.description}</p>
          )}
          <div className="flex gap-4 mt-3">
            <div className="flex flex-col">
              <span className="text-[20px] font-bold" style={{ color: '#4ade80' }}>{program.daysPerWeek}</span>
              <span className="text-[11px]" style={{ color: '#6b7280' }}>дней/нед</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold" style={{ color: '#4ade80' }}>{program.templates.length}</span>
              <span className="text-[11px]" style={{ color: '#6b7280' }}>тренировок</span>
            </div>
          </div>
        </div>

        {/* Days list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}
            >
              ПРОГРАММА
            </span>
            <button
              onClick={() => setShowAddDay(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
                cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              Добавить день
            </button>
          </div>

          {program.templates.map(template => {
            const muscleGroups = getMuscleGroups(template)
            return (
              <div
                key={template.id}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontFamily: 'var(--font-mono)' }}
                >
                  {template.order + 1}
                </div>
                <button
                  onClick={() => onEditDay(template.id)}
                  className="flex-1 min-w-0 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold" style={{ color: '#f9fafb' }}>
                      {template.name}
                    </span>
                    <span className="text-[11px]" style={{ color: '#6b7280' }}>
                      {template.exercises.length} упр.
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {muscleGroups.length > 0
                      ? muscleGroups.map(mg => (
                          <span
                            key={mg}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: `${MUSCLE_GROUP_COLORS[mg]}20`, color: MUSCLE_GROUP_COLORS[mg] }}
                          >
                            {MUSCLE_GROUP_LABELS[mg]}
                          </span>
                        ))
                      : <span className="text-[11px]" style={{ color: '#6b7280' }}>Нет упражнений</span>
                    }
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEditDay(template.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer' }}
                  >
                    <ChevronRight size={14} color="#6b7280" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(template.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} color="#f87171" />
                  </button>
                </div>
              </div>
            )
          })}

          {program.templates.length === 0 && (
            <div
              className="rounded-2xl py-10 flex flex-col items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <p className="text-[13px]" style={{ color: '#6b7280' }}>Добавьте дни тренировок</p>
            </div>
          )}
        </div>
      </div>

      {/* Add day bottom sheet */}
      {showAddDay && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowAddDay(false)}
        >
          <div
            className="w-full px-4 pb-8 pt-4 rounded-t-3xl flex flex-col gap-3"
            style={{ background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ background: 'rgba(255,255,255,0.09)' }} />
            <h3 className="text-[16px] font-bold" style={{ color: '#f9fafb' }}>Новый день</h3>
            <input
              value={newDayName}
              onChange={e => setNewDayName(e.target.value)}
              placeholder="День А / Верх / Ноги"
              className="px-3 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f9fafb' }}
              autoFocus
            />
            <button
              onClick={handleAddDay}
              disabled={!newDayName.trim() || addingDay}
              className="w-full h-12 rounded-2xl font-bold text-[15px]"
              style={{
                background: newDayName.trim() ? '#4ade80' : 'rgba(255,255,255,0.09)',
                color: newDayName.trim() ? '#0f172a' : '#6b7280',
                border: 'none',
                cursor: newDayName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Delete day confirm */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full px-4 pb-8 pt-5 flex flex-col gap-3 rounded-t-3xl"
            style={{ background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[16px] font-semibold text-center" style={{ color: '#f9fafb' }}>Удалить день?</p>
            <p className="text-[13px] text-center" style={{ color: '#6b7280' }}>Все упражнения будут удалены</p>
            <button
              onClick={() => handleDeleteDay(confirmDelete)}
              disabled={removingDay}
              className="w-full h-12 rounded-2xl font-bold text-[15px]"
              style={{ background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Удалить
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="w-full h-12 rounded-2xl font-medium text-[15px]"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer' }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
