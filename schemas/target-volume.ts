import { z } from 'zod'

export const targetVolumeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reps'),
    min: z.number().min(1, 'Минимум 1 повторение'),
    max: z.number().min(1).optional(),
  }),
  z.object({
    type: z.literal('time'),
    seconds: z.number().min(1, 'Минимум 1 секунда'),
  }),
])

export type TargetVolumeInput = z.infer<typeof targetVolumeSchema>
