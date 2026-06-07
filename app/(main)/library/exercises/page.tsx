'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Exercise, MuscleGroup } from '@/types'
import { useExercises } from '@/hooks/use-exercises'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS, ALL_MUSCLE_GROUPS } from '@/lib/muscle-groups'
import ExerciseCard from '@/components/screens/library/exercise-card'
import AddLibrarySheet from '@/components/screens/library/add-library-sheet'
import { SkeletonList } from '@/components/ui/loader'
import { FAB } from '@/components/ui/fab'
import { EmptyState } from '@/components/ui/empty-state'

export default function ExercisesPage() {
  const router = useRouter()
  const [search, setSearch]             = useState('')
  const [filterMg, setFilterMg]         = useState<MuscleGroup | null>(null)
  const [showFilter, setShowFilter]     = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)

  const { data: exercises = [], isLoading } = useExercises()

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

  if (isLoading) {
    return (
      <div className="flex flex-col px-4 pt-4 gap-3">
        <SkeletonList count={6} height={56} />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Search + filter row */}
      <div className="px-4 pt-4 pb-3 flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl"
          style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
        >
          <Search size={15} color="var(--color-app-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск упражнений..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: 'var(--color-app-text)', fontFamily: 'inherit' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={13} color="var(--color-app-muted)" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(f => !f)}
          className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            background: filterMg ? 'var(--color-app-accent-dim)' : 'var(--color-app-card)',
            border: `1px solid ${filterMg ? 'var(--color-app-accent)' : 'var(--color-app-card-border)'}`,
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={16} color={filterMg ? 'var(--color-app-accent)' : 'var(--color-app-muted)'} />
        </button>
      </div>

      {/* Muscle group filter chips */}
      {showFilter && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFilterMg(null)}
            className="px-3 py-1 rounded-xl text-[12px] font-medium whitespace-nowrap flex-shrink-0"
            style={{
              background: !filterMg ? 'var(--color-app-accent-soft)' : 'var(--color-app-card)',
              border: `1px solid ${!filterMg ? 'var(--color-app-accent)' : 'var(--color-app-card-border)'}`,
              color: !filterMg ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
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
                  background: active ? `${color}20` : 'var(--color-app-card)',
                  border: `1px solid ${active ? color : 'var(--color-app-card-border)'}`,
                  color: active ? color : 'var(--color-app-muted)',
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
          <EmptyState emoji="🔍" title="Ничего не найдено" />
        ) : (
          grouped.map(({ mg, list }) => {
            const color = MUSCLE_GROUP_COLORS[mg]
            return (
              <div key={mg}>
                <div className="px-4 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span
                    className="text-[11px] font-bold tracking-widest uppercase"
                    style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {MUSCLE_GROUP_LABELS[mg]}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-app-card-border)' }}>{list.length}</span>
                </div>
                <div
                  className="mx-4 rounded-2xl overflow-hidden"
                  style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
                >
                  {list.map((ex, idx) => (
                    <div key={ex.id}>
                      {idx > 0 && <div style={{ height: 1, background: 'var(--color-app-card-border)', margin: '0 16px' }} />}
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

      <FAB onClick={() => setShowAddSheet(true)} ariaLabel="Добавить упражнение" />

      <AddLibrarySheet
        open={showAddSheet}
        context="exercises"
        onClose={() => setShowAddSheet(false)}
        onCreate={() => { setShowAddSheet(false); router.push('/library/exercises/new') }}
      />
    </div>
  )
}
