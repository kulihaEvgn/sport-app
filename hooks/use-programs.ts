import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPrograms,
  getProgram,
  getActiveProgram,
  getActiveProgramState,
  setActiveProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getTemplateById,
  addTemplate,
  updateTemplate,
  removeTemplate,
  addExerciseToDay,
  updateDayExercise,
  removeExerciseFromDay,
  reorderExercises,
  type AddTemplateInput,
  type DayExerciseInput,
  type UpdateDayExerciseInput,
} from '@/services/programs'

export const programKeys = {
  all:          () => ['programs'] as const,
  detail:       (id: string) => ['programs', id] as const,
  active:       () => ['programs', 'active'] as const,
  activeState:  () => ['programs', 'active-state'] as const,
  template:     (id: string) => ['templates', id] as const,
}

export function usePrograms() {
  return useQuery({
    queryKey: programKeys.all(),
    queryFn:  getPrograms,
  })
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn:  () => getProgram(id),
    enabled:  Boolean(id),
  })
}

export function useActiveProgram() {
  return useQuery({
    queryKey: programKeys.active(),
    queryFn:  getActiveProgram,
  })
}

export function useActiveProgramState() {
  return useQuery({
    queryKey: programKeys.activeState(),
    queryFn:  getActiveProgramState,
  })
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: programKeys.template(templateId),
    queryFn:  () => getTemplateById(templateId),
    enabled:  Boolean(templateId),
  })
}

export function useSetActiveProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => setActiveProgram(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all() })
      qc.invalidateQueries({ queryKey: programKeys.active() })
      qc.invalidateQueries({ queryKey: programKeys.activeState() })
    },
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; description?: string; daysPerWeek: number }) =>
      createProgram(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: programKeys.all() }),
  })
}

export function useUpdateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id, input,
    }: { id: string; input: Partial<Pick<Parameters<typeof updateProgram>[1], never>> & Parameters<typeof updateProgram>[1] }) =>
      updateProgram(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: programKeys.all() })
      qc.invalidateQueries({ queryKey: programKeys.detail(id) })
    },
  })
}

export function useDeleteProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: programKeys.all() }),
  })
}

export function useAddTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, input }: { programId: string; input: AddTemplateInput }) =>
      addTemplate(programId, input),
    onSuccess: (_data, { programId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.all() })
    },
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, templateId, input }: {
      programId: string
      templateId: string
      input: Partial<Pick<Parameters<typeof updateTemplate>[2], never>> & Parameters<typeof updateTemplate>[2]
    }) => updateTemplate(programId, templateId, input),
    onSuccess: (_data, { programId, templateId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.template(templateId) })
    },
  })
}

export function useRemoveTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, templateId }: { programId: string; templateId: string }) =>
      removeTemplate(programId, templateId),
    onSuccess: (_data, { programId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.all() })
    },
  })
}

export function useAddExerciseToDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, templateId, input }: {
      programId: string
      templateId: string
      input: DayExerciseInput
    }) => addExerciseToDay(programId, templateId, input),
    onSuccess: (_data, { programId, templateId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.template(templateId) })
    },
  })
}

export function useUpdateDayExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, templateId, teId, input }: {
      programId: string
      templateId: string
      teId: string
      input: UpdateDayExerciseInput
    }) => updateDayExercise(programId, templateId, teId, input),
    onSuccess: (_data, { programId, templateId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.template(templateId) })
    },
  })
}

export function useReorderExercises() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, templateId, orderedIds }: {
      programId: string
      templateId: string
      orderedIds: string[]
    }) => reorderExercises(programId, templateId, orderedIds),
    onSuccess: (_data, { programId, templateId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.template(templateId) })
    },
  })
}

export function useRemoveExerciseFromDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, templateId, teId }: {
      programId: string
      templateId: string
      teId: string
    }) => removeExerciseFromDay(programId, templateId, teId),
    onSuccess: (_data, { programId, templateId }) => {
      qc.invalidateQueries({ queryKey: programKeys.detail(programId) })
      qc.invalidateQueries({ queryKey: programKeys.template(templateId) })
    },
  })
}
