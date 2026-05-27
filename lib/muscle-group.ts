/** Значения enum MuscleGroup из prisma/schema.prisma — без импорта @prisma/client. */
export const MUSCLE_GROUPS = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
  "FULL_BODY",
  "GLUTES",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  CHEST: "Грудь",
  BACK: "Спина",
  LEGS: "Ноги",
  SHOULDERS: "Плечи",
  ARMS: "Руки",
  CORE: "Кор",
  FULL_BODY: "Всё тело",
  GLUTES: "Ягодицы",
};

export type ExerciseRecord = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: number;
  videoUrl: string | null;
  imageUrl: string | null;
  userId: string | null;
  createdAt: Date;
};

export type ExerciseListFilter = {
  OR: Array<{ userId: null } | { userId: string }>;
  muscleGroup?: MuscleGroup;
};
