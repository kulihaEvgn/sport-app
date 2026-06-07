import type { MuscleGroup } from '@/types'
import type { CreateExerciseInput } from '@/services/exercises'

// Maps Russian/English muscle group aliases to canonical MuscleGroup values.
const MUSCLE_ALIASES: Record<string, MuscleGroup> = {
  chest: 'chest',     грудь: 'chest',         грудные: 'chest',
  back: 'back',       спина: 'back',
  legs: 'legs',       ноги: 'legs',
  shoulders: 'shoulders', плечи: 'shoulders', дельты: 'shoulders',
  biceps: 'biceps',   бицепс: 'biceps',
  triceps: 'triceps', трицепс: 'triceps',
  core: 'core',       пресс: 'core',          кор: 'core',
  other: 'other',     другое: 'other',        прочее: 'other',
}

function normalizeMuscleGroup(value: string | undefined): MuscleGroup {
  if (!value) return 'other'
  const key = value.trim().toLowerCase()
  return MUSCLE_ALIASES[key] ?? 'other'
}

function normalizeEquipment(value: string | undefined): string {
  if (!value) return 'Без инвентаря'
  return value.trim() || 'Без инвентаря'
}

const COLUMN_ALIASES: Record<string, keyof RawRow> = {
  name: 'name', название: 'name', упражнение: 'name', exercise: 'name',
  musclegroup: 'muscleGroup', muscle: 'muscleGroup', группамышц: 'muscleGroup', мышцы: 'muscleGroup', группа: 'muscleGroup',
  equipment: 'equipment', инвентарь: 'equipment', оборудование: 'equipment',
  videourl: 'videoUrl', video: 'videoUrl', видео: 'videoUrl', youtube: 'videoUrl', ссылка: 'videoUrl',
  description: 'description', описание: 'description', desc: 'description',
}

interface RawRow {
  name?: string
  muscleGroup?: string
  equipment?: string
  videoUrl?: string
  description?: string
}

// Re-keys an arbitrary row to canonical RawRow keys using COLUMN_ALIASES.
export function normalizeRow(raw: Record<string, unknown>): RawRow {
  const out: RawRow = {}
  for (const [key, value] of Object.entries(raw)) {
    const normalizedKey = key.replace(/\s+/g, '').toLowerCase()
    const target = COLUMN_ALIASES[normalizedKey]
    if (target && typeof value === 'string') {
      out[target] = value
    } else if (target && value != null) {
      out[target] = String(value)
    }
  }
  return out
}

// Converts a raw row into a CreateExerciseInput. Returns null when name is missing.
export function rowToExercise(raw: Record<string, unknown>): CreateExerciseInput | null {
  const row = normalizeRow(raw)
  const name = row.name?.trim()
  if (!name) return null
  return {
    name,
    muscleGroup: normalizeMuscleGroup(row.muscleGroup),
    equipment:   normalizeEquipment(row.equipment),
    videoUrl:    row.videoUrl?.trim() || undefined,
    description: row.description?.trim() || undefined,
  }
}

// Parses a single markdown table block into an array of rows.
// Expects: | header1 | header2 | ... |  \n | --- | --- | ... |  \n | val | val | ... |
export function parseMarkdownTable(md: string): Record<string, string>[] {
  const lines = md.split('\n').map(l => l.trim()).filter(Boolean)
  const tableStart = lines.findIndex(l => l.startsWith('|'))
  if (tableStart < 0 || tableStart + 1 >= lines.length) return []

  const header = lines[tableStart]
    .split('|')
    .slice(1, -1)
    .map(s => s.trim())
  if (!header.length) return []

  // Skip separator (---) if present
  let dataStart = tableStart + 1
  if (lines[dataStart]?.match(/^\|\s*[-:]+/)) dataStart++

  const rows: Record<string, string>[] = []
  for (let i = dataStart; i < lines.length; i++) {
    if (!lines[i].startsWith('|')) break
    const cells = lines[i].split('|').slice(1, -1).map(s => s.trim())
    if (cells.every(c => !c)) continue
    const row: Record<string, string> = {}
    header.forEach((h, idx) => {
      row[h] = cells[idx] ?? ''
    })
    rows.push(row)
  }
  return rows
}
