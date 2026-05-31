import { z } from 'zod'

export const programSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  daysPerWeek: z.number().min(1).max(7),
})

export type ProgramInput = z.infer<typeof programSchema>
