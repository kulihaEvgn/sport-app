import { z } from "zod";

import {
  ExerciseListFilter,
  ExerciseRecord,
  MUSCLE_GROUPS,
  MuscleGroup,
  muscleGroupLabels,
} from "@/lib/muscle-group";

export { MUSCLE_GROUPS, muscleGroupLabels, type MuscleGroup };

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().url().optional());

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(100),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  difficulty: z.coerce.number().int().min(1).max(5),
  videoUrl: optionalUrl,
  imageUrl: optionalUrl,
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const listExercisesQuerySchema = z.object({
  muscleGroup: z.enum(MUSCLE_GROUPS).optional(),
});

export type SerializedExercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: number;
  videoUrl: string | null;
  imageUrl: string | null;
  isOwn: boolean;
  createdAt: string;
};

export function serializeExercise(exercise: ExerciseRecord): SerializedExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    difficulty: exercise.difficulty,
    videoUrl: exercise.videoUrl,
    imageUrl: exercise.imageUrl,
    isOwn: exercise.userId !== null,
    createdAt: exercise.createdAt.toISOString(),
  };
}

export function exercisesListWhere(
  userId: string,
  muscleGroup?: MuscleGroup,
): ExerciseListFilter {
  return {
    OR: [{ userId: null }, { userId }],
    ...(muscleGroup ? { muscleGroup } : {}),
  };
}

export function canModifyExercise(exercise: ExerciseRecord, userId: string): boolean {
  return exercise.userId === userId;
}
