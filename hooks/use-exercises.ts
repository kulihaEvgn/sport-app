import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  type CreateExerciseInput,
} from '@/services/exercises'

export const exerciseKeys = {
  all:    () => ['exercises'] as const,
  detail: (id: string) => ['exercises', id] as const,
}

export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.all(),
    queryFn:  getExercises,
  })
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn:  () => getExercise(id),
    enabled:  Boolean(id),
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => createExercise(input),
    onSuccess:  () => qc.invalidateQueries({ queryKey: exerciseKeys.all() }),
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateExerciseInput> }) =>
      updateExercise(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: exerciseKeys.all() })
      qc.invalidateQueries({ queryKey: exerciseKeys.detail(id) })
    },
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: exerciseKeys.all() }),
  })
}
