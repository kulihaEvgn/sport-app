'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { programSchema, type ProgramInput } from '@/schemas/program'
import type { Program } from '@/types'

interface Props {
  initial?: Program
  onSave: (input: ProgramInput) => Promise<void>
  onClose: () => void
}

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

export default function ProgramForm({ initial, onSave, onClose }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgramInput>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name:        initial?.name        ?? '',
      description: initial?.description ?? '',
      daysPerWeek: initial?.daysPerWeek ?? 3,
    },
  })

  const daysPerWeek = watch('daysPerWeek')

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--color-app-bg)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-app-border)' }}
      >
        <span className="text-[16px] font-semibold" style={{ color: 'var(--color-app-text)' }}>
          {initial ? 'Редактировать программу' : 'Новая программа'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-app-surface3)', cursor: 'pointer' }}
        >
          <X size={16} color="var(--color-app-text)" />
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Название
          </label>
          <input
            {...register('name')}
            placeholder="Full Body / Сила / Масса"
            className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{
              background: 'var(--color-app-surface2)',
              border: `1px solid ${errors.name ? 'var(--color-app-error)' : 'var(--color-app-border)'}`,
              color: 'var(--color-app-text)',
            }}
          />
          {errors.name && (
            <span className="text-[11px]" style={{ color: 'var(--color-app-error)' }}>{errors.name.message}</span>
          )}
        </div>

        {/* Days per week */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Дней в неделю
          </label>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setValue('daysPerWeek', d)}
                className="w-10 h-10 rounded-xl text-[14px] font-bold transition-all flex-shrink-0"
                style={{
                  background: daysPerWeek === d ? 'var(--color-app-accent-soft)' : 'var(--color-app-surface2)',
                  border: `1px solid ${daysPerWeek === d ? 'var(--color-app-accent)' : 'var(--color-app-border)'}`,
                  color: daysPerWeek === d ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[12px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Описание (опционально)
          </label>
          <textarea
            {...register('description')}
            placeholder="Цель программы, особенности..."
            rows={3}
            className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
            style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-text)' }}
          />
        </div>

        {/* Save */}
        <div className="pt-2 pb-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl text-[15px] font-bold transition-all"
            style={{
              background: isSubmitting ? 'var(--color-app-border)' : 'var(--color-app-accent)',
              color: isSubmitting ? 'var(--color-app-muted)' : 'var(--color-app-on-accent)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Сохраняю...' : (initial ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </form>
  )
}
