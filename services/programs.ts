import type { Program, WorkoutTemplate } from '@/types'
import { MOCK_PROGRAMS } from '@/data/mock'

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
    isActive: false,
    templates: [],
    createdAt: new Date(),
  }
  programs = [program, ...programs]
  return program
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
