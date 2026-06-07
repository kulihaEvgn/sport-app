'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react'
import { exerciseSchema, type ExerciseInput } from '@/schemas/exercise'
import type { Exercise } from '@/types'
import { MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'
import { generateExerciseDescription, generateExerciseImage } from '@/services/ai'
import { useSafeAreaInsets } from '@/hooks/use-safe-area'

const EQUIPMENT_OPTIONS = ['Штанга', 'Гантели', 'Блок', 'Тренажёр', 'Без инвентаря'] as const

interface Props {
  initial?: Exercise
  onSave: (input: ExerciseInput) => Promise<void>
  onClose: () => void
}

export default function ExerciseForm({ initial, onSave, onClose }: Props) {
  const [generatingDesc,  setGeneratingDesc]  = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const { top, bottom } = useSafeAreaInsets()

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
      imageUrl:    initial?.imageUrl    ?? '',
    },
  })

  const name        = watch('name')
  const muscleGroup = watch('muscleGroup')
  const equipment   = watch('equipment')
  const imageUrl    = watch('imageUrl')

  async function handleGenerateDesc() {
    if (!name.trim()) return
    setGeneratingDesc(true)
    try {
      const result = await generateExerciseDescription({ name, muscleGroup, equipment })
      setValue('description', `${result.description}\n\nТехника: ${result.technique}\n\nОшибки: ${result.commonMistakes}`)
    } finally {
      setGeneratingDesc(false)
    }
  }

  async function handleGenerateImage() {
    if (!name.trim()) return
    setGeneratingImage(true)
    try {
      const url = await generateExerciseImage({ name, muscleGroup, equipment })
      setValue('imageUrl', url)
    } finally {
      setGeneratingImage(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--color-app-bg)', paddingTop: top, paddingBottom: bottom }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-app-border)' }}>
        <span className="text-[16px] font-semibold" style={{ color: 'var(--color-app-text)' }}>
          {initial ? 'Редактировать' : 'Новое упражнение'}
        </span>
        <button type="button" onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-app-surface3)', cursor: 'pointer' }}>
          <X size={16} color="var(--color-app-text)" />
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            Название
          </label>
          <input
            {...register('name')}
            placeholder="Жим штанги лёжа"
            className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{ background: 'var(--color-app-surface2)', border: `1px solid ${errors.name ? 'var(--color-app-error)' : 'var(--color-app-border)'}`, color: 'var(--color-app-text)' }}
          />
          {errors.name && (
            <span className="text-[11px]" style={{ color: 'var(--color-app-error)' }}>{errors.name.message}</span>
          )}
        </div>

        {/* Muscle group */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
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
                      background: active ? `${color}20` : 'var(--color-app-surface2)',
                      border: `1px solid ${active ? color : 'var(--color-app-border)'}`,
                      color: active ? color : 'var(--color-app-muted)',
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
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            Инвентарь
          </label>
          <Controller name="equipment" control={control} render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(eq => (
                <button key={eq} type="button" onClick={() => field.onChange(eq)}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all"
                  style={{
                    background: field.value === eq ? 'rgba(34,211,238,0.12)' : 'var(--color-app-surface2)',
                    border: `1px solid ${field.value === eq ? 'var(--color-app-cyan)' : 'var(--color-app-border)'}`,
                    color: field.value === eq ? 'var(--color-app-cyan)' : 'var(--color-app-muted)',
                    cursor: 'pointer',
                  }}>
                  {eq}
                </button>
              ))}
            </div>
          )} />
          {errors.equipment && (
            <span className="text-[11px]" style={{ color: 'var(--color-app-error)' }}>{errors.equipment.message}</span>
          )}
        </div>

        {/* YouTube */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
            YouTube (опционально)
          </label>
          <input
            {...register('videoUrl')}
            placeholder="https://youtube.com/watch?v=..."
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: 'var(--color-app-surface2)', border: `1px solid ${errors.videoUrl ? 'var(--color-app-error)' : 'var(--color-app-border)'}`, color: 'var(--color-app-text)' }}
          />
          {errors.videoUrl && (
            <span className="text-[11px]" style={{ color: 'var(--color-app-error)' }}>{errors.videoUrl.message}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
              Описание
            </label>
            <button
              type="button"
              onClick={handleGenerateDesc}
              disabled={!name.trim() || generatingDesc}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: 'var(--color-app-accent-dim)',
                border: '1px solid var(--color-app-accent-border-2)',
                color: 'var(--color-app-accent)',
                cursor: name.trim() && !generatingDesc ? 'pointer' : 'not-allowed',
                opacity: name.trim() && !generatingDesc ? 1 : 0.5,
              }}
            >
              {generatingDesc
                ? <Loader2 size={11} className="animate-spin" />
                : <Sparkles size={11} />
              }
              ИИ
            </button>
          </div>
          <textarea
            {...register('description')}
            placeholder="Техника выполнения..."
            rows={4}
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
            style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-text)' }}
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
              Картинка
            </label>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={!name.trim() || generatingImage}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: 'var(--color-app-accent-dim)',
                border: '1px solid var(--color-app-accent-border-2)',
                color: 'var(--color-app-accent)',
                cursor: name.trim() && !generatingImage ? 'pointer' : 'not-allowed',
                opacity: name.trim() && !generatingImage ? 1 : 0.5,
              }}
            >
              {generatingImage
                ? <Loader2 size={11} className="animate-spin" />
                : <ImageIcon size={11} />
              }
              {generatingImage ? 'Генерирую...' : 'ИИ'}
            </button>
          </div>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Фото упражнения: ${name}`}
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: 180, border: '1px solid var(--color-app-border)' }}
            />
          ) : (
            <div
              className="w-full rounded-xl flex items-center justify-center"
              style={{ height: 80, background: 'var(--color-app-surface2)', border: '1px dashed var(--color-app-border)' }}
            >
              <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
                Нажми «ИИ» для генерации
              </span>
            </div>
          )}
          <input type="hidden" {...register('imageUrl')} />
        </div>

        {/* Save */}
        <div className="pt-2 pb-8">
          <button type="submit" disabled={isSubmitting}
            className="w-full h-12 rounded-2xl text-[15px] font-bold transition-all"
            style={{
              background: isSubmitting ? 'var(--color-app-border)' : 'var(--color-app-accent)',
              color: isSubmitting ? 'var(--color-app-muted)' : 'var(--color-app-on-accent)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}>
            {isSubmitting ? 'Сохраняю...' : (initial ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </form>
  )
}
