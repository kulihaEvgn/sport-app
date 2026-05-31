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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0f0f0f' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #2d2d4e' }}
      >
        <span className="text-[16px] font-semibold" style={{ color: '#f9fafb' }}>
          Выбрать упражнение
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: '#2d2d4e', cursor: 'pointer' }}
        >
          <X size={16} color="#f9fafb" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
        >
          <Search size={15} color="#6b7280" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск..."
            className="flex-1 py-2.5 text-[14px] outline-none bg-transparent"
            style={{ color: '#f9fafb' }}
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
              background: !filter ? 'rgba(74,222,128,0.15)' : '#1a1a2e',
              border: `1px solid ${!filter ? '#4ade80' : '#2d2d4e'}`,
              color: !filter ? '#4ade80' : '#6b7280',
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
                  background: active ? `${color}20` : '#1a1a2e',
                  border: `1px solid ${active ? color : '#2d2d4e'}`,
                  color: active ? color : '#6b7280',
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
            <p className="text-[14px]" style={{ color: '#6b7280' }}>Нет упражнений</p>
          </div>
        )}
        {filtered.map(ex => {
          const color = MUSCLE_GROUP_COLORS[ex.muscleGroup]
          return (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', cursor: 'pointer' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                style={{ background: `${color}20`, color }}
              >
                {MUSCLE_GROUP_LABELS[ex.muscleGroup].slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-semibold block truncate" style={{ color: '#f9fafb' }}>
                  {ex.name}
                </span>
                <span className="text-[12px]" style={{ color: '#6b7280' }}>
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
