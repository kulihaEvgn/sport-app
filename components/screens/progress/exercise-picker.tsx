'use client'

import type { Exercise } from '@/types'

interface Props {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExercisePicker({ exercises, selectedId, onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[60vh] rounded-t-3xl flex flex-col"
        style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2" style={{ background: '#2d2d4e' }} />
        <p className="text-[15px] font-bold px-4 pb-2" style={{ color: '#f9fafb' }}>Выбери упражнение</p>
        <div className="overflow-y-auto pb-6">
          {exercises.map(ex => {
            const active = ex.id === selectedId
            return (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="w-full text-left px-4 py-3 text-[14px]"
                style={{
                  background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                  color: active ? '#4ade80' : '#f9fafb',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {ex.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
