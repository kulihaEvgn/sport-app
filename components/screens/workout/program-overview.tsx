'use client'

import { ChevronRight, Zap } from 'lucide-react'
import type { Program, WorkoutTemplate } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'

interface Props {
  program: Program
  currentDayIndex: number
  onStartDay: (template: WorkoutTemplate) => void
  onChangeProgram: () => void
}

export default function ProgramOverview({ program, currentDayIndex, onStartDay, onChangeProgram }: Props) {
  const nextTemplate = program.templates.length > 0
    ? program.templates[currentDayIndex % program.templates.length]
    : null

  return (
    <div className="flex flex-col px-4 pt-5 gap-5">
      {/* Active program card */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: 'var(--color-app-accent-subtle)', border: '1px solid var(--color-app-accent-border-2)' }}
      >
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-app-accent)', fontFamily: 'var(--font-mono)' }}>
          АКТИВНАЯ ПРОГРАММА
        </span>
        <h2 className="text-[18px] font-bold mt-1" style={{ color: 'var(--color-app-text)' }}>{program.name}</h2>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-app-muted)' }}>
          {program.daysPerWeek} дн/нед · {program.templates.length} тренировок
        </p>
        {nextTemplate && (
          <button
            onClick={() => onStartDay(nextTemplate)}
            className="w-full mt-4 h-12 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-bold"
            style={{ background: 'var(--color-app-accent)', color: 'var(--color-app-on-accent)', border: 'none', cursor: 'pointer' }}
          >
            <Zap size={18} fill="var(--color-app-on-accent)" />
            Следующая: {nextTemplate.name}
          </button>
        )}
      </div>

      {/* Days cycle */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
          ЦИКЛ ТРЕНИРОВОК
        </span>
        {program.templates.map((template, idx) => {
          const isCurrent = idx === currentDayIndex % program.templates.length
          const muscleGroups = [...new Set(template.exercises.map(te => te.exercise.muscleGroup))].slice(0, 2)
          return (
            <button
              key={template.id}
              onClick={() => onStartDay(template)}
              className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all active:opacity-80"
              style={{
                background: isCurrent ? 'var(--color-app-accent-glow)' : 'var(--color-app-card)',
                border: `1px solid ${isCurrent ? 'var(--color-app-accent-border-2)' : 'var(--color-app-card-border)'}`,
                cursor: 'pointer',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
                style={{
                  background: isCurrent ? 'var(--color-app-accent-soft)' : 'var(--color-app-card-alt)',
                  color: isCurrent ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {template.order + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-app-text)' }}>{template.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--color-app-accent-mid)', color: 'var(--color-app-accent)' }}>
                      СЛЕД.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>{template.exercises.length} упр.</span>
                  {muscleGroups.map(mg => (
                    <span key={mg} className="text-[11px]" style={{ color: MUSCLE_GROUP_COLORS[mg] }}>
                      {MUSCLE_GROUP_LABELS[mg]}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={16} color="var(--color-app-muted)" />
            </button>
          )
        })}
      </div>

      <button
        onClick={onChangeProgram}
        className="text-[13px] font-medium py-2 text-center"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-muted)' }}
      >
        Сменить программу
      </button>
    </div>
  )
}
