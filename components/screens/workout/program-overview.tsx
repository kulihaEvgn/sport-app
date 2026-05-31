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
  const nextTemplate = program.templates[currentDayIndex % program.templates.length]

  return (
    <div className="flex flex-col px-4 pt-5 gap-5">
      {/* Active program card */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)' }}
      >
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
          АКТИВНАЯ ПРОГРАММА
        </span>
        <h2 className="text-[18px] font-bold mt-1" style={{ color: '#f9fafb' }}>{program.name}</h2>
        <p className="text-[13px] mt-0.5" style={{ color: '#6b7280' }}>
          {program.daysPerWeek} дн/нед · {program.templates.length} тренировок
        </p>
        <button
          onClick={() => onStartDay(nextTemplate)}
          className="w-full mt-4 h-12 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-bold"
          style={{ background: '#4ade80', color: '#0f172a', border: 'none', cursor: 'pointer' }}
        >
          <Zap size={18} fill="#0f172a" />
          Следующая: {nextTemplate.name}
        </button>
      </div>

      {/* Days cycle */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
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
                background: isCurrent ? 'rgba(74,222,128,0.06)' : '#1a1a2e',
                border: `1px solid ${isCurrent ? 'rgba(74,222,128,0.3)' : '#2d2d4e'}`,
                cursor: 'pointer',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
                style={{
                  background: isCurrent ? 'rgba(74,222,128,0.15)' : '#16213e',
                  color: isCurrent ? '#4ade80' : '#6b7280',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {template.order + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: '#f9fafb' }}>{template.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}>
                      СЛЕД.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px]" style={{ color: '#6b7280' }}>{template.exercises.length} упр.</span>
                  {muscleGroups.map(mg => (
                    <span key={mg} className="text-[11px]" style={{ color: MUSCLE_GROUP_COLORS[mg] }}>
                      {MUSCLE_GROUP_LABELS[mg]}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={16} color="#6b7280" />
            </button>
          )
        })}
      </div>

      <button
        onClick={onChangeProgram}
        className="text-[13px] font-medium py-2 text-center"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
      >
        Сменить программу
      </button>
    </div>
  )
}
