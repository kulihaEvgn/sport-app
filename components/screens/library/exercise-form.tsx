'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import type { Exercise, MuscleGroup, Difficulty, Equipment } from '@/types'
import type { CreateExerciseInput } from '@/services/exercises'
import { MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'

const EQUIPMENT_OPTIONS: Equipment[] = ['Штанга', 'Гантели', 'Блок', 'Тренажёр', 'Без инвентаря']

interface Props {
  initial?: Exercise
  onSave: (input: CreateExerciseInput) => Promise<void>
  onClose: () => void
}

export default function ExerciseForm({ initial, onSave, onClose }: Props) {
  const [name, setName]               = useState(initial?.name ?? '')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(initial?.muscleGroup ?? 'chest')
  const [difficulty, setDifficulty]   = useState<Difficulty>(initial?.difficulty ?? 3)
  const [equipment, setEquipment]     = useState<Equipment>(initial?.equipment ?? 'Штанга')
  const [videoUrl, setVideoUrl]       = useState(initial?.videoUrl ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [saving, setSaving]           = useState(false)
  const [generating, setGenerating]   = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), muscleGroup, difficulty, equipment, videoUrl: videoUrl || undefined, description: description || undefined })
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 800))
    setDescription(`${name} — эффективное упражнение для ${MUSCLE_GROUP_LABELS[muscleGroup].toLowerCase()}. Выполняйте с контролируемой техникой, акцентируя нагрузку в целевой мышце. Следите за дыханием: выдох на усилии, вдох на расслаблении.`)
    setGenerating(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0f0f0f' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid #2d2d4e' }}
      >
        <span className="text-[16px] font-semibold" style={{ color: '#f9fafb' }}>
          {initial ? 'Редактировать' : 'Новое упражнение'}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: '#2d2d4e', border: 'none', cursor: 'pointer' }}
        >
          <X size={16} color="#f9fafb" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Название
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Жим штанги лёжа"
            className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{
              background: '#1a1a2e',
              border: '1px solid #2d2d4e',
              color: '#f9fafb',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Muscle group */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Группа мышц
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_MUSCLE_GROUPS.map(mg => {
              const active = muscleGroup === mg
              const color = MUSCLE_GROUP_COLORS[mg]
              return (
                <button
                  key={mg}
                  onClick={() => setMuscleGroup(mg)}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all"
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

        {/* Difficulty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Сложность
          </label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="w-10 h-10 rounded-xl text-[13px] font-bold transition-all"
                style={{
                  background: difficulty >= d ? 'rgba(74,222,128,0.15)' : '#1a1a2e',
                  border: `1px solid ${difficulty >= d ? '#4ade80' : '#2d2d4e'}`,
                  color: difficulty >= d ? '#4ade80' : '#6b7280',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Инвентарь
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(eq => (
              <button
                key={eq}
                onClick={() => setEquipment(eq)}
                className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all"
                style={{
                  background: equipment === eq ? 'rgba(34,211,238,0.12)' : '#1a1a2e',
                  border: `1px solid ${equipment === eq ? '#22d3ee' : '#2d2d4e'}`,
                  color: equipment === eq ? '#22d3ee' : '#6b7280',
                  cursor: 'pointer',
                }}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* YouTube */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            YouTube (опционально)
          </label>
          <input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
            style={{
              background: '#1a1a2e',
              border: '1px solid #2d2d4e',
              color: '#f9fafb',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
              Описание
            </label>
            <button
              onClick={handleGenerate}
              disabled={!name.trim() || generating}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: !name.trim() ? 0.5 : 1,
              }}
            >
              <Sparkles size={11} />
              {generating ? 'Генерирую...' : 'ИИ'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Техника выполнения..."
            rows={4}
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
            style={{
              background: '#1a1a2e',
              border: '1px solid #2d2d4e',
              color: '#f9fafb',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Save button — inside scroll so keyboard doesn't cover it */}
        <div className="pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full h-12 rounded-2xl text-[15px] font-bold transition-all"
            style={{
              background: name.trim() ? '#4ade80' : '#2d2d4e',
              color: name.trim() ? '#0f172a' : '#6b7280',
              border: 'none',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Сохраняю...' : (initial ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </div>
  )
}
