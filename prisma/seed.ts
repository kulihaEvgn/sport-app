import { MuscleGroup, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedExercise = {
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: number;
  videoUrl?: string;
};

const EXERCISES: SeedExercise[] = [
  { name: "Жим штанги лёжа", muscleGroup: "CHEST", difficulty: 4 },
  { name: "Жим гантелей на наклонной", muscleGroup: "CHEST", difficulty: 3 },
  { name: "Отжимания на брусьях", muscleGroup: "CHEST", difficulty: 3 },
  { name: "Сведение в кроссовере", muscleGroup: "CHEST", difficulty: 2 },
  { name: "Подтягивания", muscleGroup: "BACK", difficulty: 4 },
  { name: "Тяга штанги в наклоне", muscleGroup: "BACK", difficulty: 4 },
  { name: "Тяга верхнего блока", muscleGroup: "BACK", difficulty: 2 },
  { name: "Тяга гантели одной рукой", muscleGroup: "BACK", difficulty: 3 },
  { name: "Приседания со штангой", muscleGroup: "LEGS", difficulty: 5 },
  { name: "Становая тяга", muscleGroup: "LEGS", difficulty: 5 },
  { name: "Жим ногами", muscleGroup: "LEGS", difficulty: 2 },
  { name: "Выпады с гантелями", muscleGroup: "LEGS", difficulty: 3 },
  { name: "Румынская тяга", muscleGroup: "LEGS", difficulty: 4 },
  { name: "Разгибание ног", muscleGroup: "LEGS", difficulty: 1 },
  { name: "Жим штанги стоя", muscleGroup: "SHOULDERS", difficulty: 4 },
  { name: "Махи гантелей в стороны", muscleGroup: "SHOULDERS", difficulty: 2 },
  { name: "Тяга к подбородку", muscleGroup: "SHOULDERS", difficulty: 3 },
  { name: "Подъём штанги на бицепс", muscleGroup: "ARMS", difficulty: 2 },
  { name: "Молотковые сгибания", muscleGroup: "ARMS", difficulty: 2 },
  { name: "Французский жим", muscleGroup: "ARMS", difficulty: 3 },
  { name: "Разгибание на блоке", muscleGroup: "ARMS", difficulty: 1 },
  { name: "Планка", muscleGroup: "CORE", difficulty: 2 },
  { name: "Скручивания", muscleGroup: "CORE", difficulty: 1 },
  { name: "Подъём ног в висе", muscleGroup: "CORE", difficulty: 4 },
  { name: "Ягодичный мост", muscleGroup: "GLUTES", difficulty: 2 },
  { name: "Выпады назад", muscleGroup: "GLUTES", difficulty: 2 },
  { name: "Берпи", muscleGroup: "FULL_BODY", difficulty: 4 },
  { name: "Трастеры", muscleGroup: "FULL_BODY", difficulty: 3 },
  { name: "Подтягивания обратным хватом", muscleGroup: "BACK", difficulty: 3 },
  { name: "Жим ногами узкой постановкой", muscleGroup: "LEGS", difficulty: 3 },
];

async function main() {
  const existing = await prisma.exercise.count({ where: { userId: null } });

  if (existing > 0) {
    console.log(`Seed skip: already ${existing} global exercises`);
    return;
  }

  await prisma.exercise.createMany({
    data: EXERCISES.map((exercise) => ({
      ...exercise,
      userId: null,
    })),
  });

  console.log(`Seeded ${EXERCISES.length} exercises`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
