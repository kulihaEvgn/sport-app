'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Play, Pencil, Plus, Trash2, ChevronRight } from 'lucide-react'
import type { Program, WorkoutTemplate } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'
import { useAddTemplate, useRemoveTemplate } from '@/hooks/use-programs'
import { ConfirmAlert } from '@/components/ui/confirm-alert'
import { BottomSheet } from '@/components/ui/bottom-sheet'

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
        style={{ borderBottom: '1px solid var(--color-app-border)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-accent)' }}
        >
          <ArrowLeft size={18} color="var(--color-app-accent)" />
          Назад
        </button>
        <div className="flex items-center gap-2">
          {program.isActive ? (
            <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--color-app-accent)' }}>
              <CheckCircle2 size={14} />
              Активна
            </div>
          ) : (
            <button
              onClick={() => onSetActive(program.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
              style={{
                background: 'var(--color-app-accent-dim)',
                border: '1px solid var(--color-app-accent-border-3)',
                color: 'var(--color-app-accent)',
                cursor: 'pointer',
              }}
            >
              <Play size={12} fill="var(--color-app-accent)" />
              Активировать
            </button>
          )}
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--color-app-surface)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--color-app-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', cursor: 'pointer' }}
          >
            <Pencil size={14} color="var(--color-app-muted)" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Title */}
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--color-app-text)' }}>{program.name}</h1>
          {program.description && (
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-app-muted)' }}>{program.description}</p>
          )}
          <div className="flex gap-4 mt-3">
            <div className="flex flex-col">
              <span className="text-[20px] font-bold" style={{ color: 'var(--color-app-accent)' }}>{program.daysPerWeek}</span>
              <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>дней/нед</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold" style={{ color: 'var(--color-app-accent)' }}>{program.templates.length}</span>
              <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>тренировок</span>
            </div>
          </div>
        </div>

        {/* Days list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
            >
              ПРОГРАММА
            </span>
            <button
              onClick={() => setShowAddDay(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{
                background: 'var(--color-app-accent-subtle)',
                border: '1px solid var(--color-app-accent-border-2)',
                color: 'var(--color-app-accent)',
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
                style={{ background: 'var(--color-app-surface)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--color-app-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ background: 'var(--color-app-accent-subtle)', color: 'var(--color-app-accent)', fontFamily: 'var(--font-mono)' }}
                >
                  {template.order + 1}
                </div>
                <button
                  onClick={() => onEditDay(template.id)}
                  className="flex-1 min-w-0 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold" style={{ color: 'var(--color-app-text)' }}>
                      {template.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>
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
                      : <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>Нет упражнений</span>
                    }
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEditDay(template.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
                  >
                    <ChevronRight size={14} color="var(--color-app-muted)" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(template.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} color="var(--color-app-error)" />
                  </button>
                </div>
              </div>
            )
          })}

          {program.templates.length === 0 && (
            <div
              className="rounded-2xl py-10 flex flex-col items-center gap-2"
              style={{ background: 'var(--color-app-surface)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--color-app-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <p className="text-[13px]" style={{ color: 'var(--color-app-muted)' }}>Добавьте дни тренировок</p>
            </div>
          )}
        </div>
      </div>

      {/* Add day bottom sheet */}
      <BottomSheet open={showAddDay} onClose={() => setShowAddDay(false)}>
        <div className="px-4 pt-4 pb-8 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--color-app-text)' }}>Новый день</h3>
            <input
              value={newDayName}
              onChange={e => setNewDayName(e.target.value)}
              placeholder="День А / Верх / Ноги"
              className="px-3 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-text)' }}
              autoFocus
            />
            <button
              onClick={handleAddDay}
              disabled={!newDayName.trim() || addingDay}
              className="w-full h-12 rounded-2xl font-bold text-[15px]"
              style={{
                background: newDayName.trim() ? 'var(--color-app-accent)' : 'var(--color-app-border)',
                color: newDayName.trim() ? 'var(--color-app-on-accent)' : 'var(--color-app-muted)',
                border: 'none',
                cursor: newDayName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Добавить
            </button>
        </div>
      </BottomSheet>

      <ConfirmAlert
        open={Boolean(confirmDelete)}
        title="Удалить день?"
        description="Все упражнения дня будут удалены безвозвратно."
        loading={removingDay}
        onConfirm={() => confirmDelete && handleDeleteDay(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
