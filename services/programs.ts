import type { Program, WorkoutTemplate, WorkoutTemplateExercise, TargetVolume, UserProgramState } from '@/types'
import { apiFetch } from '@/lib/api-client'

export type AddTemplateInput = { name: string }

export type DayExerciseInput = {
  exerciseId: string
  targetSets: number
  targetVolume: TargetVolume
  restSeconds: number
  plannedWeight?: number
}

export type UpdateDayExerciseInput = Partial<Omit<DayExerciseInput, 'exerciseId'>>

export type AIGeneratedTemplate = {
  name: string
  exercises: Array<{
    exerciseId: string
    targetSets: number
    targetVolume: TargetVolume
    restSeconds: number
    plannedWeight?: number
  }>
}

export async function getPrograms(): Promise<Program[]> {
  return apiFetch<Program[]>('/api/programs')
}

export async function getProgram(id: string): Promise<Program | null> {
  try {
    return await apiFetch<Program>(`/api/programs/${id}`)
  } catch {
    return null
  }
}

export async function getActiveProgram(): Promise<Program | null> {
  const programs = await getPrograms()
  return programs.find(p => p.isActive) ?? null
}

export async function setActiveProgram(id: string): Promise<void> {
  await apiFetch<void>(`/api/programs/${id}/set-active`, { method: 'POST' })
}

export async function createProgram(input: {
  name: string
  description?: string
  daysPerWeek: number
}): Promise<Program> {
  return apiFetch<Program>('/api/programs', { method: 'POST', body: JSON.stringify(input) })
}

export async function createFullProgram(input: {
  name: string
  description?: string
  daysPerWeek: number
  templates: AIGeneratedTemplate[]
}): Promise<Program> {
  return apiFetch<Program>('/api/programs/full', { method: 'POST', body: JSON.stringify(input) })
}

export async function getActiveProgramState(): Promise<UserProgramState | null> {
  const active = await getActiveProgram()
  if (!active) return null
  return apiFetch<UserProgramState>(`/api/programs/${active.id}/state`)
}

export async function advanceProgramDay(completedDayIndex: number): Promise<void> {
  const active = await getActiveProgram()
  if (!active) return
  await apiFetch<void>(`/api/programs/${active.id}/advance`, {
    method: 'POST',
    body: JSON.stringify({ completedDayIndex }),
  })
}

export async function updateProgram(
  id: string,
  input: Partial<Pick<Program, 'name' | 'description' | 'daysPerWeek'>>,
): Promise<Program> {
  return apiFetch<Program>(`/api/programs/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteProgram(id: string): Promise<void> {
  await apiFetch<void>(`/api/programs/${id}`, { method: 'DELETE' })
}

export async function getTemplate(programId: string, templateId: string): Promise<WorkoutTemplate | null> {
  const program = await getProgram(programId)
  return program?.templates.find(t => t.id === templateId) ?? null
}

export async function getTemplateById(templateId: string): Promise<WorkoutTemplate | null> {
  const programs = await getPrograms()
  for (const p of programs) {
    const t = p.templates.find(t => t.id === templateId)
    if (t) return t
  }
  return null
}

export async function addTemplate(programId: string, input: AddTemplateInput): Promise<WorkoutTemplate> {
  return apiFetch<WorkoutTemplate>(`/api/programs/${programId}/templates`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateTemplate(
  programId: string,
  templateId: string,
  input: Partial<Pick<WorkoutTemplate, 'name'>>,
): Promise<WorkoutTemplate> {
  return apiFetch<WorkoutTemplate>(`/api/programs/${programId}/templates/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function removeTemplate(programId: string, templateId: string): Promise<void> {
  await apiFetch<void>(`/api/programs/${programId}/templates/${templateId}`, { method: 'DELETE' })
}

export async function addExerciseToDay(
  programId: string,
  templateId: string,
  input: DayExerciseInput,
): Promise<WorkoutTemplateExercise> {
  return apiFetch<WorkoutTemplateExercise>(
    `/api/programs/${programId}/templates/${templateId}/exercises`,
    { method: 'POST', body: JSON.stringify(input) },
  )
}

export async function updateDayExercise(
  programId: string,
  templateId: string,
  teId: string,
  input: UpdateDayExerciseInput,
): Promise<WorkoutTemplateExercise> {
  return apiFetch<WorkoutTemplateExercise>(
    `/api/programs/${programId}/templates/${templateId}/exercises/${teId}`,
    { method: 'PUT', body: JSON.stringify(input) },
  )
}

export async function reorderExercises(
  programId: string,
  templateId: string,
  orderedIds: string[],
): Promise<void> {
  await apiFetch<void>(
    `/api/programs/${programId}/templates/${templateId}/exercises/reorder`,
    { method: 'POST', body: JSON.stringify({ orderedIds }) },
  )
}

export async function removeExerciseFromDay(
  programId: string,
  templateId: string,
  teId: string,
): Promise<void> {
  await apiFetch<void>(
    `/api/programs/${programId}/templates/${templateId}/exercises/${teId}`,
    { method: 'DELETE' },
  )
}

// ─── Share / import ─────────────────────────────────────────────────────

export type SharedProgramPreview = Pick<Program, 'name' | 'description' | 'daysPerWeek' | 'cycleLength' | 'createdAt'> & {
  shareId: string
  templates: Array<Pick<WorkoutTemplate, 'name'> & {
    exercises: Array<{
      exerciseName: string
      muscleGroup: string
      targetSets: number
      targetVolume: TargetVolume
    }>
  }>
}

export async function shareProgram(id: string): Promise<{ shareId: string; url: string }> {
  return apiFetch<{ shareId: string; url: string }>(`/api/programs/${id}/share`, { method: 'POST' })
}

export async function getSharedProgram(shareId: string): Promise<SharedProgramPreview | null> {
  try {
    return await apiFetch<SharedProgramPreview>(`/api/programs/shared/${shareId}`, { skipAuth: true })
  } catch {
    return null
  }
}

export async function importSharedProgram(shareId: string): Promise<Program> {
  return apiFetch<Program>(`/api/programs/shared/${shareId}/import`, { method: 'POST' })
}
