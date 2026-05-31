'use client'

import { ChevronLeft, Zap } from 'lucide-react'
import type { WorkoutTemplate } from '@/types'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'

interface Props {
  template: WorkoutTemplate
  onStart: () => void
  onBack: () => void
}

export default function DayPreview({ template, onStart, onBack }: Props) {
  const muscleGroups = [...new Set(template.exercises.map(te => te.exercise.muscleGroup))]
  const totalSets = template.exercises.reduce((s, te) => s + te.targetSets, 0)

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="#4ade80" />
        </button>
        <span className="text-[16px] font-semibold ml-2" style={{ color: '#f9fafb' }}>{template.name}</span>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5 flex-1">
        {/* Stats banner */}
        <div
          className="rounded-2xl px-4 py-4 flex gap-6"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}
        >
          <div>
            <div className="text-[22px] font-bold" style={{ color: '#4ade80' }}>{template.exercises.length}</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>упражнений</div>
          </div>
          <div>
            <div className="text-[22px] font-bold" style={{ color: '#4ade80' }}>{totalSets}</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>подходов</div>
          </div>
          <div className="flex flex-wrap gap-1 flex-1 content-center">
            {muscleGroups.map(mg => (
              <span
                key={mg}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg"
                style={{ background: `${MUSCLE_GROUP_COLORS[mg]}20`, color: MUSCLE_GROUP_COLORS[mg] }}
              >
                {MUSCLE_GROUP_LABELS[mg]}
              </span>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            УПРАЖНЕНИЯ
          </span>
          {template.exercises.map((te, idx) => (
            <div
              key={te.id}
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <span className="text-[13px] font-bold w-5 flex-shrink-0" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="text-[14px] font-semibold" style={{ color: '#f9fafb' }}>{te.exercise.name}</div>
                <div className="text-[12px] mt-0.5" style={{ color: '#6b7280' }}>
                  {te.targetSets} ×{' '}
                  {te.targetVolume.type === 'reps'
                    ? te.targetVolume.max
                      ? `${te.targetVolume.min}-${te.targetVolume.max}`
                      : String(te.targetVolume.min)
                    : `${te.targetVolume.seconds}с`}
                  {te.plannedWeight ? ` · ${te.plannedWeight} кг` : ''}
                </div>
              </div>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg"
                style={{
                  background: `${MUSCLE_GROUP_COLORS[te.exercise.muscleGroup]}15`,
                  color: MUSCLE_GROUP_COLORS[te.exercise.muscleGroup],
                }}
              >
                {MUSCLE_GROUP_LABELS[te.exercise.muscleGroup]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 pt-2">
        <button
          onClick={onStart}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[16px] font-bold"
          style={{ background: '#4ade80', color: '#0f172a', border: 'none', cursor: 'pointer' }}
        >
          <Zap size={20} fill="#0f172a" />
          Начать тренировку
        </button>
      </div>
    </div>
  )
}
