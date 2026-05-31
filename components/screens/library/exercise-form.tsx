'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Sparkles } from 'lucide-react'
import { exerciseSchema, type ExerciseInput } from '@/schemas/exercise'
import type { Exercise } from '@/types'
import { MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'

const EQUIPMENT_OPTIONS = ['Штанга', 'Гантели', 'Блок', 'Тренажёр', 'Без инвентаря'] as const

interface Props {
  initial?: Exercise
  onSave: (input: ExerciseInput) => Promise<void>
  onClose: () => void
}

export default function ExerciseForm({ initial, onSave, onClose }: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseInput>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name:        initial?.name        ?? '',
      muscleGroup: initial?.muscleGroup ?? 'chest',
      equipment:   initial?.equipment   ?? 'Штанга',
      videoUrl:    initial?.videoUrl    ?? '',
      description: initial?.description ?? '',
    },
  })

  const name        = watch('name')
  const muscleGroup = watch('muscleGroup')

  async function handleGenerate() {
    await new Promise(r => setTimeout(r, 800))
    setValue(
      'description',
      `${name} — эффективное упражнение для ${MUSCLE_GROUP_LABELS[muscleGroup].toLowerCase()}. Выполняйте с контролируемой техникой, акцентируя нагрузку в целевой мышце. Следите за дыханием: выдох на усилии, вдох на расслаблении.`,
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#07070e' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        <span className="text-[16px] font-semibold" style={{ color: '#f9fafb' }}>
          {initial ? 'Редактировать' : 'Новое упражнение'}
        </span>
        <button type="button" onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <X size={16} color="#f9fafb" />
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Название
          </label>
          <input
            {...register('name')}
            placeholder="Жим штанги лёжа"
            className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.name ? '#f87171' : 'rgba(255,255,255,0.09)'}`, color: '#f9fafb' }}
          />
          {errors.name && (
            <span className="text-[11px]" style={{ color: '#f87171' }}>{errors.name.message}</span>
          )}
        </div>

        {/* Muscle group */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Группа мышц
          </label>
          <Controller name="muscleGroup" control={control} render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {ALL_MUSCLE_GROUPS.map(mg => {
                const active = field.value === mg
                const color  = MUSCLE_GROUP_COLORS[mg]
                return (
                  <button key={mg} type="button" onClick={() => field.onChange(mg)}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all"
                    style={{
                      background: active ? `${color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${active ? color : 'rgba(255,255,255,0.09)'}`,
                      color: active ? color : '#6b7280',
                      cursor: 'pointer',
                    }}>
                    {MUSCLE_GROUP_LABELS[mg]}
                  </button>
                )
              })}
            </div>
          )} />
        </div>

        {/* Equipment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            Инвентарь
          </label>
          <Controller name="equipment" control={control} render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(eq => (
                <button key={eq} type="button" onClick={() => field.onChange(eq)}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all"
                  style={{
                    background: field.value === eq ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${field.value === eq ? '#22d3ee' : 'rgba(255,255,255,0.09)'}`,
                    color: field.value === eq ? '#22d3ee' : '#6b7280',
                    cursor: 'pointer',
                  }}>
                  {eq}
                </button>
              ))}
            </div>
          )} />
          {errors.equipment && (
            <span className="text-[11px]" style={{ color: '#f87171' }}>{errors.equipment.message}</span>
          )}
        </div>

        {/* YouTube */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            YouTube (опционально)
          </label>
          <input
            {...register('videoUrl')}
            placeholder="https://youtube.com/watch?v=..."
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.videoUrl ? '#f87171' : 'rgba(255,255,255,0.09)'}`, color: '#f9fafb' }}
          />
          {errors.videoUrl && (
            <span className="text-[11px]" style={{ color: '#f87171' }}>{errors.videoUrl.message}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold tracking-widest uppercase"
              style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
              Описание
            </label>
            <button type="button" onClick={handleGenerate} disabled={!name.trim()}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.5,
              }}>
              <Sparkles size={11} />
              ИИ
            </button>
          </div>
          <textarea
            {...register('description')}
            placeholder="Техника выполнения..."
            rows={4}
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f9fafb' }}
          />
        </div>

        {/* Save */}
        <div className="pt-2 pb-8">
          <button type="submit" disabled={isSubmitting}
            className="w-full h-12 rounded-2xl text-[15px] font-bold transition-all"
            style={{
              background: isSubmitting ? 'rgba(255,255,255,0.09)' : '#4ade80',
              color: isSubmitting ? '#6b7280' : '#0f172a',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}>
            {isSubmitting ? 'Сохраняю...' : (initial ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </form>
  )
}
