'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Reorder, useDragControls } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, GripVertical, Pencil } from 'lucide-react'
import type { Exercise, TargetVolume, WorkoutTemplateExercise } from '@/types'
import {
  useTemplate,
  useAddExerciseToDay,
  useUpdateDayExercise,
  useRemoveExerciseFromDay,
  useReorderExercises,
} from '@/hooks/use-programs'
import ExercisePicker from '@/components/screens/library/exercise-picker'
import { ConfirmAlert } from '@/components/ui/confirm-alert'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { ExerciseInfoSheet } from '@/components/ui/exercise-info-sheet'
import { PageLoader } from '@/components/ui/loader'
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/muscle-groups'

interface ConfigState {
  exercise: Exercise
  targetSets: number
  volumeType: 'reps' | 'time'
  repsMin: number
  repsMax: number
  seconds: number
  restSeconds: number
  plannedWeight: string
}

interface EditConfig {
  te: WorkoutTemplateExercise
  targetSets: number
  volumeType: 'reps' | 'time'
  repsMin: number
  repsMax: number
  seconds: number
  restSeconds: number
  plannedWeight: string
}

function formatVolume(tv: TargetVolume): string {
  if (tv.type === 'reps') return tv.max ? `${tv.min}–${tv.max} повт.` : `${tv.min} повт.`
  return `${tv.seconds} с`
}

export default function DayEditorPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>
}) {
  const { id: programId, dayId: templateId } = use(params)
  const router = useRouter()

  const { data: template, isLoading: loadingTemplate } = useTemplate(templateId)
  const { mutateAsync: addExercise,    isPending: adding }    = useAddExerciseToDay()
  const { mutateAsync: updateExercise, isPending: updating }  = useUpdateDayExercise()
  const { mutateAsync: removeExercise, isPending: removing }  = useRemoveExerciseFromDay()
  const { mutateAsync: reorderMutation }                       = useReorderExercises()

  const [exercises, setExercises] = useState<WorkoutTemplateExercise[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [addConfig, setAddConfig]   = useState<ConfigState | null>(null)
  const [editConfig, setEditConfig] = useState<EditConfig | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [infoTe, setInfoTe]         = useState<WorkoutTemplateExercise | null>(null)

  // Sync local order from server data
  useEffect(() => {
    if (template) {
      setExercises([...template.exercises].sort((a, b) => a.order - b.order))
    }
  }, [template])

  function openAddConfig(exercise: Exercise) {
    setShowPicker(false)
    setAddConfig({
      exercise,
      targetSets: 3,
      volumeType: 'reps',
      repsMin: 8,
      repsMax: 12,
      seconds: 30,
      restSeconds: 90,
      plannedWeight: '',
    })
  }

  function openEditConfig(te: WorkoutTemplateExercise) {
    const tv = te.targetVolume
    setEditConfig({
      te,
      targetSets: te.targetSets,
      volumeType: tv.type,
      repsMin: tv.type === 'reps' ? tv.min : 8,
      repsMax: tv.type === 'reps' ? (tv.max ?? 12) : 12,
      seconds: tv.type === 'time' ? tv.seconds : 30,
      restSeconds: te.restSeconds,
      plannedWeight: te.plannedWeight ? String(te.plannedWeight) : '',
    })
  }

  async function handleAdd() {
    if (!addConfig) return
    const tv: TargetVolume = addConfig.volumeType === 'reps'
      ? { type: 'reps', min: addConfig.repsMin, max: addConfig.repsMax || undefined }
      : { type: 'time', seconds: addConfig.seconds }
    await addExercise({
      programId,
      templateId,
      input: {
        exerciseId:   addConfig.exercise.id,
        targetSets:   addConfig.targetSets,
        targetVolume: tv,
        restSeconds:  addConfig.restSeconds,
        plannedWeight: addConfig.plannedWeight ? parseFloat(addConfig.plannedWeight) : undefined,
      },
    })
    setAddConfig(null)
  }

  async function handleUpdate() {
    if (!editConfig) return
    const tv: TargetVolume = editConfig.volumeType === 'reps'
      ? { type: 'reps', min: editConfig.repsMin, max: editConfig.repsMax || undefined }
      : { type: 'time', seconds: editConfig.seconds }
    await updateExercise({
      programId,
      templateId,
      teId: editConfig.te.id,
      input: {
        targetSets:   editConfig.targetSets,
        targetVolume: tv,
        restSeconds:  editConfig.restSeconds,
        plannedWeight: editConfig.plannedWeight ? parseFloat(editConfig.plannedWeight) : undefined,
      },
    })
    setEditConfig(null)
  }

  async function handleRemove(teId: string) {
    await removeExercise({ programId, templateId, teId })
    setConfirmDel(null)
  }

  async function handleDragEnd(newOrder: WorkoutTemplateExercise[]) {
    await reorderMutation({
      programId,
      templateId,
      orderedIds: newOrder.map(e => e.id),
    })
  }

  if (loadingTemplate) return <PageLoader />
  if (!template) return null

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-app-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-accent)' }}
        >
          <ArrowLeft size={18} color="var(--color-app-accent)" />
          Назад
        </button>
        <span className="text-[16px] font-semibold" style={{ color: 'var(--color-app-text)' }}>
          {template.name}
        </span>
        <button
          onClick={() => setShowPicker(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{
            background: 'var(--color-app-accent-subtle)',
            border: '1px solid var(--color-app-accent-border-2)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} color="var(--color-app-accent)" />
        </button>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-[14px]" style={{ color: 'var(--color-app-muted)' }}>Добавьте упражнения</p>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold"
              style={{
                background: 'var(--color-app-accent-subtle)',
                border: '1px solid var(--color-app-accent-border-2)',
                color: 'var(--color-app-accent)',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              Добавить упражнение
            </button>
          </div>
        )}

        <Reorder.Group
          axis="y"
          values={exercises}
          onReorder={setExercises}
          className="flex flex-col gap-2"
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          {exercises.map((te) => (
            <ExerciseRow
              key={te.id}
              te={te}
              onInfo={() => setInfoTe(te)}
              onEdit={() => openEditConfig(te)}
              onDelete={() => setConfirmDel(te.id)}
              onDragEnd={() => handleDragEnd(exercises)}
            />
          ))}
        </Reorder.Group>
      </div>

      {/* Exercise picker overlay */}
      {showPicker && (
        <ExercisePicker
          onSelect={openAddConfig}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Add config sheet */}
      {addConfig && (
        <ConfigSheet
          title={addConfig.exercise.name}
          targetSets={addConfig.targetSets}
          volumeType={addConfig.volumeType}
          repsMin={addConfig.repsMin}
          repsMax={addConfig.repsMax}
          seconds={addConfig.seconds}
          restSeconds={addConfig.restSeconds}
          plannedWeight={addConfig.plannedWeight}
          saving={adding}
          onChange={patch => setAddConfig(prev => prev ? { ...prev, ...patch } : null)}
          onSave={handleAdd}
          onClose={() => setAddConfig(null)}
        />
      )}

      {/* Edit config sheet */}
      {editConfig && (
        <ConfigSheet
          title={editConfig.te.exercise.name}
          targetSets={editConfig.targetSets}
          volumeType={editConfig.volumeType}
          repsMin={editConfig.repsMin}
          repsMax={editConfig.repsMax}
          seconds={editConfig.seconds}
          restSeconds={editConfig.restSeconds}
          plannedWeight={editConfig.plannedWeight}
          saving={updating}
          onChange={patch => setEditConfig(prev => prev ? { ...prev, ...patch } : null)}
          onSave={handleUpdate}
          onClose={() => setEditConfig(null)}
        />
      )}

      {infoTe && <ExerciseInfoSheet te={infoTe} onClose={() => setInfoTe(null)} />}

      <ConfirmAlert
        open={Boolean(confirmDel)}
        title="Удалить упражнение?"
        description="Упражнение будет убрано из этого дня."
        loading={removing}
        onConfirm={() => confirmDel && handleRemove(confirmDel)}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}

// ─── Exercise row with drag handle ───────────────────────────────────────────

function ExerciseRow({
  te, onInfo, onEdit, onDelete, onDragEnd,
}: {
  te: WorkoutTemplateExercise
  onInfo: () => void
  onEdit: () => void
  onDelete: () => void
  onDragEnd: () => void
}) {
  const dragControls = useDragControls()
  const color = MUSCLE_GROUP_COLORS[te.exercise.muscleGroup]

  return (
    <Reorder.Item
      value={te}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        background: 'var(--color-app-surface)',
        border: '1px solid var(--color-app-border)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        listStyle: 'none',
        cursor: 'default',
        touchAction: 'none',
      }}
    >
      {/* Drag handle */}
      <div
        onPointerDown={e => dragControls.start(e)}
        className="flex items-center gap-1.5 shrink-0 touch-none"
        style={{ cursor: 'grab', WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <GripVertical size={16} color="rgba(255,255,255,0.25)" />
      </div>

      {/* Exercise info — tap to view detail */}
      <button
        onClick={onInfo}
        className="flex-1 min-w-0 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
            style={{ background: `${color}20`, color }}
          >
            {MUSCLE_GROUP_LABELS[te.exercise.muscleGroup].slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-app-text)' }}>
            {te.exercise.name}
          </span>
        </div>
        <div className="flex gap-3 mt-0.5">
          <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
            {te.targetSets} × {formatVolume(te.targetVolume)}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
            {te.restSeconds}с отдых
          </span>
          {te.plannedWeight && (
            <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
              {te.plannedWeight} кг
            </span>
          )}
        </div>
      </button>

      {/* Edit */}
      <button
        onClick={onEdit}
        className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
        style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
      >
        <Pencil size={13} color="var(--color-app-muted-2)" />
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
        style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', cursor: 'pointer' }}
      >
        <Trash2 size={14} color="var(--color-app-error)" />
      </button>
    </Reorder.Item>
  )
}

// ─── Config sheet ─────────────────────────────────────────────────────────────

interface ConfigPatch {
  targetSets?: number
  volumeType?: 'reps' | 'time'
  repsMin?: number
  repsMax?: number
  seconds?: number
  restSeconds?: number
  plannedWeight?: string
}

interface ConfigSheetProps {
  title: string
  targetSets: number
  volumeType: 'reps' | 'time'
  repsMin: number
  repsMax: number
  seconds: number
  restSeconds: number
  plannedWeight: string
  saving: boolean
  onChange: (patch: ConfigPatch) => void
  onSave: () => void
  onClose: () => void
}

function NumberPad({
  label, value, onChange, min = 1, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; step?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-lg text-[18px] font-bold flex items-center justify-center"
          style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-text)', cursor: 'pointer' }}
        >
          −
        </button>
        <span
          className="w-10 text-center text-[16px] font-bold"
          style={{ color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="w-8 h-8 rounded-lg text-[18px] font-bold flex items-center justify-center"
          style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-text)', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  )
}

function ConfigSheet({
  title, targetSets, volumeType, repsMin, repsMax, seconds, restSeconds, plannedWeight,
  saving, onChange, onSave, onClose,
}: ConfigSheetProps) {
  return (
    <BottomSheet open onClose={onClose}>
      <div className="px-4 pb-8 pt-4 flex flex-col gap-4 overflow-y-auto">
        <h3 className="text-[15px] font-bold truncate" style={{ color: 'var(--color-app-text)' }}>{title}</h3>

        <NumberPad label="Подходы" value={targetSets} onChange={v => onChange({ targetSets: v })} />

        {/* Volume type */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>Тип объёма</span>
          <div className="flex gap-2">
            {(['reps', 'time'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ volumeType: t })}
                className="flex-1 h-9 rounded-xl text-[13px] font-semibold"
                style={{
                  background: volumeType === t ? 'var(--color-app-accent-soft)' : 'var(--color-app-surface2)',
                  border: `1px solid ${volumeType === t ? 'var(--color-app-accent)' : 'var(--color-app-border)'}`,
                  color: volumeType === t ? 'var(--color-app-accent)' : 'var(--color-app-muted)',
                  cursor: 'pointer',
                }}
              >
                {t === 'reps' ? 'Повторения' : 'Время'}
              </button>
            ))}
          </div>
        </div>

        {volumeType === 'reps' ? (
          <div className="flex gap-6">
            <NumberPad label="Мин повт." value={repsMin} onChange={v => onChange({ repsMin: v })} />
            <NumberPad label="Макс повт." value={repsMax} onChange={v => onChange({ repsMax: v })} />
          </div>
        ) : (
          <NumberPad label="Секунды" value={seconds} min={5} step={5} onChange={v => onChange({ seconds: v })} />
        )}

        <NumberPad label="Отдых (сек)" value={restSeconds} min={10} step={10} onChange={v => onChange({ restSeconds: v })} />

        <div className="flex flex-col gap-1">
          <span className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>Плановый вес (кг, опционально)</span>
          <input
            value={plannedWeight}
            onChange={e => onChange({ plannedWeight: e.target.value })}
            placeholder="60"
            inputMode="decimal"
            className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-text)' }}
          />
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl font-bold text-[15px] mt-2"
          style={{
            background: saving ? 'var(--color-app-border)' : 'var(--color-app-accent)',
            color: saving ? 'var(--color-app-muted)' : 'var(--color-app-accent-text)',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </div>
    </BottomSheet>
  )
}
