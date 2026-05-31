'use client'

import { motion } from 'framer-motion'
import type { Exercise } from '@/types'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'

interface Props {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExercisePicker({ exercises, selectedId, onSelect, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-h-[65vh] rounded-t-3xl flex flex-col"
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
                className="w-full text-left px-4 py-3 flex items-center gap-3"
                style={{
                  background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                  style={{
                    background: `${MUSCLE_GROUP_COLORS[ex.muscleGroup]}20`,
                    color: MUSCLE_GROUP_COLORS[ex.muscleGroup],
                  }}
                >
                  {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                </span>
                <span className="text-[14px]" style={{ color: active ? '#4ade80' : '#f9fafb' }}>
                  {ex.name}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
