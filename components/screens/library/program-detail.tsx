'use client'

import { ArrowLeft, CheckCircle2, Play } from 'lucide-react'
import type { Program, WorkoutTemplate } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'

interface Props {
  program: Program
  onBack: () => void
  onSetActive: (id: string) => void
}

function getMuscleGroups(template: WorkoutTemplate) {
  const groups = [...new Set(template.exercises.map(te => te.exercise.muscleGroup))]
  return groups.slice(0, 3)
}

export default function ProgramDetail({ program, onBack, onSetActive }: Props) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #2d2d4e' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80' }}
        >
          <ArrowLeft size={18} color="#4ade80" />
          Назад
        </button>
        {!program.isActive && (
          <button
            onClick={() => onSetActive(program.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', cursor: 'pointer' }}
          >
            <Play size={12} fill="#4ade80" />
            Активировать
          </button>
        )}
        {program.isActive && (
          <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: '#4ade80' }}>
            <CheckCircle2 size={14} />
            Активна
          </div>
        )}
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
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            ПРОГРАММА
          </span>
          {program.templates.map(template => {
            const muscleGroups = getMuscleGroups(template)
            return (
              <div
                key={template.id}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontFamily: 'var(--font-mono)' }}
                >
                  {template.dayNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold" style={{ color: '#f9fafb' }}>
                      {template.name}
                    </span>
                    <span className="text-[11px]" style={{ color: '#6b7280' }}>
                      {template.exercises.length} упр.
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {muscleGroups.map(mg => (
                      <span
                        key={mg}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                        style={{
                          background: `${MUSCLE_GROUP_COLORS[mg]}20`,
                          color: MUSCLE_GROUP_COLORS[mg],
                        }}
                      >
                        {MUSCLE_GROUP_LABELS[mg]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
