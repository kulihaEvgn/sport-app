import type { Program, WorkoutTemplate, WorkoutTemplateExercise, TargetVolume, UserProgramState } from '@/types'
import { MOCK_PROGRAMS, MOCK_USER_PROGRAM_STATE } from '@/data/mock'
import { getExercise } from './exercises'

export type AddTemplateInput = { name: string }

export type DayExerciseInput = {
  exerciseId: string
  targetSets: number
  targetVolume: TargetVolume
  restSeconds: number
  plannedWeight?: number
}

export type UpdateDayExerciseInput = Partial<Omit<DayExerciseInput, 'exerciseId'>>

let userProgramState: UserProgramState = { ...MOCK_USER_PROGRAM_STATE }

let programs = [...MOCK_PROGRAMS]

export async function getPrograms(): Promise<Program[]> {
  return programs
}

export async function getProgram(id: string): Promise<Program | null> {
  return programs.find(p => p.id === id) ?? null
}

export async function getActiveProgram(): Promise<Program | null> {
  return programs.find(p => p.isActive) ?? null
}

export async function setActiveProgram(id: string): Promise<void> {
  programs = programs.map(p => ({ ...p, isActive: p.id === id }))
}

export async function createProgram(input: {
  name: string
  description?: string
  daysPerWeek: number
}): Promise<Program> {
  const program: Program = {
    id: `prog-${Date.now()}`,
    ...input,
    cycleLength: 0,
    isActive: false,
    templates: [],
    createdAt: new Date(),
  }
  programs = [program, ...programs]
  return program
}

export async function getActiveProgramState(): Promise<UserProgramState | null> {
  const active = programs.find(p => p.isActive)
  if (!active) return null
  if (userProgramState.programId !== active.id) {
    userProgramState = { userId: userProgramState.userId, programId: active.id, currentDayIndex: 0 }
  }
  return userProgramState
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function advanceProgramDay(userId: string): Promise<void> {
  const active = programs.find(p => p.isActive)
  if (!active) return
  userProgramState = {
    ...userProgramState,
    currentDayIndex: (userProgramState.currentDayIndex + 1) % active.cycleLength,
  }
}

export async function updateProgram(
  id: string,
  input: Partial<Pick<Program, 'name' | 'description' | 'daysPerWeek'>>,
): Promise<Program> {
  programs = programs.map(p => p.id === id ? { ...p, ...input } : p)
  return programs.find(p => p.id === id)!
}

export async function deleteProgram(id: string): Promise<void> {
  programs = programs.filter(p => p.id !== id)
}

export async function getTemplate(programId: string, templateId: string): Promise<WorkoutTemplate | null> {
  const program = programs.find(p => p.id === programId)
  return program?.templates.find(t => t.id === templateId) ?? null
}

export async function getTemplateById(templateId: string): Promise<WorkoutTemplate | null> {
  for (const program of programs) {
    const template = program.templates.find(t => t.id === templateId)
    if (template) return template
  }
  return null
}

function updateProgramTemplates(programId: string, updater: (ts: WorkoutTemplate[]) => WorkoutTemplate[]) {
  programs = programs.map(p => {
    if (p.id !== programId) return p
    const templates = updater(p.templates)
    return { ...p, templates, cycleLength: templates.length }
  })
}

export async function addTemplate(programId: string, input: AddTemplateInput): Promise<WorkoutTemplate> {
  const program = programs.find(p => p.id === programId)
  if (!program) throw new Error('Program not found')
  const template: WorkoutTemplate = {
    id: `tmpl-${Date.now()}`,
    programId,
    order: program.templates.length,
    name: input.name,
    exercises: [],
  }
  updateProgramTemplates(programId, ts => [...ts, template])
  return template
}

export async function updateTemplate(
  programId: string,
  templateId: string,
  input: Partial<Pick<WorkoutTemplate, 'name'>>,
): Promise<WorkoutTemplate> {
  updateProgramTemplates(programId, ts =>
    ts.map(t => t.id === templateId ? { ...t, ...input } : t),
  )
  return (await getTemplate(programId, templateId))!
}

export async function removeTemplate(programId: string, templateId: string): Promise<void> {
  updateProgramTemplates(programId, ts => {
    const filtered = ts.filter(t => t.id !== templateId)
    return filtered.map((t, i) => ({ ...t, order: i }))
  })
}

export async function addExerciseToDay(
  programId: string,
  templateId: string,
  input: DayExerciseInput,
): Promise<WorkoutTemplateExercise> {
  const exercise = await getExercise(input.exerciseId)
  if (!exercise) throw new Error('Exercise not found')

  const template = await getTemplate(programId, templateId)
  if (!template) throw new Error('Template not found')

  const te: WorkoutTemplateExercise = {
    id: `te-${Date.now()}`,
    exerciseId: input.exerciseId,
    exercise,
    order: template.exercises.length + 1,
    targetSets: input.targetSets,
    targetVolume: input.targetVolume,
    restSeconds: input.restSeconds,
    plannedWeight: input.plannedWeight,
  }
  updateProgramTemplates(programId, ts =>
    ts.map(t => t.id === templateId
      ? { ...t, exercises: [...t.exercises, te] }
      : t),
  )
  return te
}

export async function updateDayExercise(
  programId: string,
  templateId: string,
  teId: string,
  input: UpdateDayExerciseInput,
): Promise<WorkoutTemplateExercise> {
  updateProgramTemplates(programId, ts =>
    ts.map(t => t.id !== templateId ? t : {
      ...t,
      exercises: t.exercises.map(e => e.id === teId ? { ...e, ...input } : e),
    }),
  )
  const template = await getTemplate(programId, templateId)
  return template!.exercises.find(e => e.id === teId)!
}

export async function removeExerciseFromDay(
  programId: string,
  templateId: string,
  teId: string,
): Promise<void> {
  updateProgramTemplates(programId, ts =>
    ts.map(t => t.id !== templateId ? t : {
      ...t,
      exercises: t.exercises
        .filter(e => e.id !== teId)
        .map((e, i) => ({ ...e, order: i + 1 })),
    }),
  )
}
