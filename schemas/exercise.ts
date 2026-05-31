import { z } from 'zod'

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  muscleGroup: z.enum([
    'chest', 'back', 'legs', 'shoulders',
    'biceps', 'triceps', 'core', 'other',
  ]),
  equipment: z.string().min(1, 'Обязательное поле'),
  videoUrl: z.string().url('Некорректная ссылка').optional().or(z.literal('')),
  description: z.string().optional(),
})

export type ExerciseInput = z.infer<typeof exerciseSchema>
