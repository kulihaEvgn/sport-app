'use client'

import { useState, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import type { Exercise, MuscleGroup } from '@/types'
import { useExercises } from '@/hooks/use-exercises'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS } from '@/lib/muscle-groups'

interface Props {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExercisePicker({ onSelect, onClose }: Props) {
  const { data: exercises = [] } = useExercises()
  const [query, setQuery]         = useState('')
  const [filter, setFilter]       = useState<MuscleGroup | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(ex => {
      const matchesQuery = !q || ex.name.toLowerCase().includes(q)
      const matchesFilter = !filter || ex.muscleGroup === filter
      return matchesQuery && matchesFilter
    })
  }, [exercises, query, filter])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-app-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-app-border)' }}
      >
        <span className="text-[16px] font-semibold" style={{ color: 'var(--color-app-text)' }}>
          Выбрать упражнение
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-app-surface3)', cursor: 'pointer' }}
        >
          <X size={16} color="var(--color-app-text)" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)' }}
        >
          <Search size={15} color="var(--color-app-muted)" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск..."
            className="flex-1 py-2.5 text-[14px] outline-none bg-transparent"
            style={{ color: 'var(--color-app-text)' }}
          />
        </div>
      </div>

      {/* Muscle group filter */}
      <div className="px-4 pb-2 flex-shrink-0 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setFilter(null)}
            className="px-3 py-1.5 rounded-xl text-[12px] font-medium flex-shrink-0"
            style={{
              background: !filter ? 'var(--color-app-accent-soft)' : 'var(--color-app-surface2)',
              border: `1px solid ${!filter ? 'var(--color-app-accent)' : 'var(--color-app-border)'}`,
              color: !filter ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
              cursor: 'pointer',
            }}
          >
            Все
          </button>
          {ALL_MUSCLE_GROUPS.map(mg => {
            const active = filter === mg
            const color  = MUSCLE_GROUP_COLORS[mg]
            return (
              <button
                key={mg}
                onClick={() => setFilter(active ? null : mg)}
                className="px-3 py-1.5 rounded-xl text-[12px] font-medium flex-shrink-0"
                style={{
                  background: active ? `${color}20` : 'var(--color-app-surface2)',
                  border: `1px solid ${active ? color : 'var(--color-app-border)'}`,
                  color: active ? color : 'var(--color-app-muted)',
                  cursor: 'pointer',
                }}
              >
                {MUSCLE_GROUP_LABELS[mg]}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px]" style={{ color: 'var(--color-app-muted)' }}>Нет упражнений</p>
          </div>
        )}
        {filtered.map(ex => {
          const color = MUSCLE_GROUP_COLORS[ex.muscleGroup]
          return (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'var(--color-app-surface)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--color-app-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                style={{ background: `${color}20`, color }}
              >
                {MUSCLE_GROUP_LABELS[ex.muscleGroup].slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-semibold block truncate" style={{ color: 'var(--color-app-text)' }}>
                  {ex.name}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
                  {ex.equipment}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
