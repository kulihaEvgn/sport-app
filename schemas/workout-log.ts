import { z } from 'zod'

// Схема тела POST /api/history. Соответствует типам WorkoutLog / SetLog
// из types/index.ts. userId сюда НЕ входит — он всегда берётся из initData
// на сервере, никогда из тела запроса.

export const setLogInputSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().min(1),
  templateExerciseId: z.string().min(1),
  setNumber: z.number().int().min(1),
  weight: z.number().min(0),
  reps: z.number().int().min(0),
  completedAt: z.coerce.date(),
})

export const workoutLogInputSchema = z.object({
  id: z.string().min(1),
  programId: z.string().min(1),
  workoutTemplateId: z.string().min(1),
  dayIndex: z.number().int().min(0),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date().optional().nullable(),
  isCompleted: z.boolean(),
  sets: z.array(setLogInputSchema),
})

export type WorkoutLogInput = z.infer<typeof workoutLogInputSchema>
export type SetLogInput = z.infer<typeof setLogInputSchema>
