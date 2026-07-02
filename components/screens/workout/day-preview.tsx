'use client'

import { useState } from 'react'
import { ChevronLeft, Zap } from 'lucide-react'
import type { WorkoutTemplate, WorkoutTemplateExercise } from '@/types'
import { ExerciseInfoSheet } from '@/components/ui/exercise-info-sheet'
import { SectionLabel } from '@/components/ui/section-label'
import { MuscleChip } from '@/components/ui/muscle-chip'

interface Props {
  template: WorkoutTemplate
  onStart: () => void
  onBack: () => void
}

export default function DayPreview({ template, onStart, onBack }: Props) {
  const [infoTe, setInfoTe] = useState<WorkoutTemplateExercise | null>(null)
  const muscleGroups = [...new Set(template.exercises.map(te => te.exercise.muscleGroup))]
  const totalSets = template.exercises.reduce((s, te) => s + te.targetSets, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 pt-4 pb-3 flex-shrink-0" style={{ background: 'var(--color-app-bg)', borderBottom: '1px solid var(--color-app-border)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="var(--color-app-accent)" />
        </button>
        <span className="text-[16px] font-semibold ml-2" style={{ color: 'var(--color-app-text)' }}>{template.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Stats banner */}
        <div
          className="rounded-2xl px-4 py-4 flex gap-6"
          style={{ background: 'var(--color-app-accent-subtle)', border: '1px solid var(--color-app-accent-border)' }}
        >
          <div>
            <div className="text-[22px] font-bold" style={{ color: 'var(--color-app-accent)' }}>{template.exercises.length}</div>
            <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>упражнений</div>
          </div>
          <div>
            <div className="text-[22px] font-bold" style={{ color: 'var(--color-app-accent)' }}>{totalSets}</div>
            <div className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>подходов</div>
          </div>
          <div className="flex flex-wrap gap-1 flex-1 content-center">
            {muscleGroups.map(mg => <MuscleChip key={mg} muscleGroup={mg} />)}
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex flex-col gap-2">
          <SectionLabel>УПРАЖНЕНИЯ</SectionLabel>
          {template.exercises.map((te, idx) => (
            <button
              key={te.id}
              onClick={() => setInfoTe(te)}
              className="rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left"
              style={{ background: 'var(--color-app-surface)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--color-app-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              <span className="text-[13px] font-bold w-5 shrink-0" style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold" style={{ color: 'var(--color-app-text)' }}>{te.exercise.name}</div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-app-muted)' }}>
                  {te.targetSets} ×{' '}
                  {te.targetVolume.type === 'reps'
                    ? te.targetVolume.max
                      ? `${te.targetVolume.min}-${te.targetVolume.max}`
                      : String(te.targetVolume.min)
                    : `${te.targetVolume.seconds}с`}
                  {te.plannedWeight ? ` · ${te.plannedWeight} кг` : ''}
                </div>
              </div>
              <span className="shrink-0">
                <MuscleChip muscleGroup={te.exercise.muscleGroup} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-shrink-0 px-4 pb-4 pt-3"
        style={{ borderTop: '1px solid var(--color-app-border)', background: 'var(--color-app-bg)' }}
      >
        <button
          onClick={onStart}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[16px] font-bold"
          style={{ background: 'var(--color-app-accent)', color: 'var(--color-app-on-accent)', border: 'none', cursor: 'pointer' }}
        >
          <Zap size={20} fill="var(--color-app-on-accent)" />
          Начать тренировку
        </button>
      </div>

      {infoTe && <ExerciseInfoSheet te={infoTe} onClose={() => setInfoTe(null)} />}
    </div>
  )
}
