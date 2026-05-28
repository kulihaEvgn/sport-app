'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react'
import type { Exercise, MuscleGroup } from '@/types'
import { getExercises } from '@/services/exercises'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS, ALL_MUSCLE_GROUPS } from '@/lib/muscle-groups'
import ExerciseCard from '@/components/screens/library/exercise-card'

export default function ExercisesPage() {
  const router = useRouter()
  const [exercises, setExercises]     = useState<Exercise[]>([])
  const [search, setSearch]           = useState('')
  const [filterMg, setFilterMg]       = useState<MuscleGroup | null>(null)
  const [showFilter, setShowFilter]   = useState(false)

  useEffect(() => {
    getExercises().then(setExercises)
  }, [])

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
      const matchMg     = !filterMg || e.muscleGroup === filterMg
      return matchSearch && matchMg
    })
  }, [exercises, search, filterMg])

  const grouped = useMemo(() => {
    const map = new Map<MuscleGroup, Exercise[]>()
    for (const e of filtered) {
      if (!map.has(e.muscleGroup)) map.set(e.muscleGroup, [])
      map.get(e.muscleGroup)!.push(e)
    }
    return ALL_MUSCLE_GROUPS
      .map(mg => ({ mg, list: map.get(mg) ?? [] }))
      .filter(g => g.list.length > 0)
  }, [filtered])

  return (
    <div className="flex flex-col">
      {/* Search + filter row */}
      <div className="px-4 pt-4 pb-3 flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl"
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
        >
          <Search size={15} color="#6b7280" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск упражнений..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: '#f9fafb', fontFamily: 'inherit' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={13} color="#6b7280" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(f => !f)}
          className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            background: filterMg ? 'rgba(74,222,128,0.12)' : '#1a1a2e',
            border: `1px solid ${filterMg ? '#4ade80' : '#2d2d4e'}`,
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={16} color={filterMg ? '#4ade80' : '#6b7280'} />
        </button>
      </div>

      {/* Muscle group filter chips */}
      {showFilter && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFilterMg(null)}
            className="px-3 py-1 rounded-xl text-[12px] font-medium whitespace-nowrap flex-shrink-0"
            style={{
              background: !filterMg ? 'rgba(74,222,128,0.15)' : '#1a1a2e',
              border: `1px solid ${!filterMg ? '#4ade80' : '#2d2d4e'}`,
              color: !filterMg ? '#4ade80' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            Все
          </button>
          {ALL_MUSCLE_GROUPS.map(mg => {
            const active = filterMg === mg
            const color  = MUSCLE_GROUP_COLORS[mg]
            return (
              <button
                key={mg}
                onClick={() => setFilterMg(active ? null : mg)}
                className="px-3 py-1 rounded-xl text-[12px] font-medium whitespace-nowrap flex-shrink-0"
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
      )}

      {/* Exercise list grouped */}
      <div className="flex flex-col">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-[32px]">🔍</span>
            <p className="text-[14px]" style={{ color: '#6b7280' }}>Ничего не найдено</p>
          </div>
        ) : (
          grouped.map(({ mg, list }) => {
            const color = MUSCLE_GROUP_COLORS[mg]
            return (
              <div key={mg}>
                <div className="px-4 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span
                    className="text-[11px] font-bold tracking-widest uppercase"
                    style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}
                  >
                    {MUSCLE_GROUP_LABELS[mg]}
                  </span>
                  <span className="text-[11px]" style={{ color: '#2d2d4e' }}>{list.length}</span>
                </div>
                <div
                  className="mx-4 rounded-2xl overflow-hidden"
                  style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
                >
                  {list.map((ex, idx) => (
                    <div key={ex.id}>
                      {idx > 0 && <div style={{ height: 1, background: '#2d2d4e', margin: '0 16px' }} />}
                      <ExerciseCard
                        exercise={ex}
                        onClick={() => router.push(`/library/exercises/${ex.id}`)}
                      />
                    </div>
                  ))}
                </div>
                <div className="h-3" />
              </div>
            )
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/library/exercises/new')}
        className="fixed flex items-center justify-center rounded-full shadow-lg"
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
    </div>
  )
}
