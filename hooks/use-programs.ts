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
