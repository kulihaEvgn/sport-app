import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dev user (matches DEV_TELEGRAM_USER.id in lib/telegram/dev-init-data.ts)
const DEV_USER_ID = '1'

type TargetVolume =
  | { type: 'reps'; min: number; max?: number }
  | { type: 'time'; seconds: number }

interface ExerciseDef {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  videoUrl?: string
  description?: string
}

const EXERCISES: ExerciseDef[] = [
  { id: 'ex-01', name: 'Жим штанги лёжа', muscleGroup: 'chest', equipment: 'Штанга', description: 'Базовое упражнение для грудных мышц. Лёжа на скамье, хват чуть шире плеч.', videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE' },
  { id: 'ex-02', name: 'Жим гантелей лёжа', muscleGroup: 'chest', equipment: 'Гантели', description: 'Жим гантелей лёжа с большей амплитудой по сравнению со штангой.' },
  { id: 'ex-03', name: 'Разводка гантелей лёжа', muscleGroup: 'chest', equipment: 'Гантели', description: 'Изолирующее упражнение для грудных мышц. Акцент на растяжение.' },
  { id: 'ex-04', name: 'Жим штанги в наклоне', muscleGroup: 'chest', equipment: 'Штанга', description: 'Жим под углом 30-45°. Акцент на верхнюю часть грудных.', videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As' },
  { id: 'ex-05', name: 'Тяга штанги в наклоне', muscleGroup: 'back', equipment: 'Штанга', description: 'Базовое упражнение для широчайших и ромбовидных мышц.', videoUrl: 'https://www.youtube.com/watch?v=9efgcAjQe7E' },
  { id: 'ex-06', name: 'Подтягивания широким хватом', muscleGroup: 'back', equipment: 'Без инвентаря', description: 'Лучшее упражнение для широчайших. Хват чуть шире плеч.', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
  { id: 'ex-07', name: 'Тяга гантели одной рукой', muscleGroup: 'back', equipment: 'Гантели', description: 'Акцентирует широчайшие и ромбовидные. Опора на скамью.' },
  { id: 'ex-08', name: 'Горизонтальная тяга в блоке', muscleGroup: 'back', equipment: 'Блок', description: 'Тяга сидя к поясу. Хорошо прорабатывает середину спины.' },
  { id: 'ex-09', name: 'Приседания со штангой', muscleGroup: 'legs', equipment: 'Штанга', description: 'Король упражнений. Штанга на трапеции, спина прямая, колени по линии носков.', videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8' },
  { id: 'ex-10', name: 'Жим ногами', muscleGroup: 'legs', equipment: 'Тренажёр', description: 'Хорошая альтернатива приседаниям. Широкая постановка ног — больше бицепс бедра.' },
  { id: 'ex-11', name: 'Разгибания ног в тренажёре', muscleGroup: 'legs', equipment: 'Тренажёр', description: 'Изолирующее упражнение для квадрицепсов.' },
  { id: 'ex-12', name: 'Сгибания ног в тренажёре', muscleGroup: 'legs', equipment: 'Тренажёр', description: 'Изолирующее упражнение для бицепса бедра.' },
  { id: 'ex-13', name: 'Выпады с гантелями', muscleGroup: 'legs', equipment: 'Гантели', description: 'Развивают баланс и проработку каждой ноги по отдельности.' },
  { id: 'ex-14', name: 'Жим гантелей сидя', muscleGroup: 'shoulders', equipment: 'Гантели', description: 'Основной жим для плеч. Больший контроль по сравнению со штангой.', videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
  { id: 'ex-15', name: 'Разводка гантелей в стороны', muscleGroup: 'shoulders', equipment: 'Гантели', description: 'Изоляция средней дельты. Небольшой вес, контроль движения.' },
  { id: 'ex-16', name: 'Тяга штанги к подбородку', muscleGroup: 'shoulders', equipment: 'Штанга', description: 'Прорабатывает передний и средний пучки дельт и трапеции.' },
  { id: 'ex-17', name: 'Подъём штанги на бицепс', muscleGroup: 'biceps', equipment: 'Штанга', description: 'Классическое базовое упражнение для бицепса.', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo' },
  { id: 'ex-18', name: 'Молоток', muscleGroup: 'biceps', equipment: 'Гантели', description: 'Нейтральный хват. Акцент на плечевую и плечелучевую мышцы.' },
  { id: 'ex-19', name: 'Французский жим', muscleGroup: 'triceps', equipment: 'Штанга', description: 'Лёжа на скамье, штанга опускается за голову. Длинная головка трицепса.' },
  { id: 'ex-20', name: 'Разгибания на блоке', muscleGroup: 'triceps', equipment: 'Блок', description: 'Хорошая изоляция трицепса. Локти прижаты к корпусу.', videoUrl: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8' },
  { id: 'ex-21', name: 'Скручивания', muscleGroup: 'core', equipment: 'Без инвентаря', description: 'Базовое упражнение для прямой мышцы живота.' },
  { id: 'ex-22', name: 'Планка', muscleGroup: 'core', equipment: 'Без инвентаря', description: 'Статическое упражнение для всего корпуса. Не опускай таз!', videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' },
  { id: 'ex-23', name: 'Пресс на тренажёре', muscleGroup: 'core', equipment: 'Блок', description: 'Скручивания с отягощением. Хорошая нагрузка на прямую мышцу.' },
]

interface DayEx {
  exId: string
  order: number
  targetSets: number
  targetVolume: TargetVolume
  restSeconds: number
  plannedWeight: number
}

const DAY_A: DayEx[] = [
  { exId: 'ex-09', order: 1, targetSets: 4, targetVolume: { type: 'reps', min: 6, max: 8 },   restSeconds: 180, plannedWeight: 100 },
  { exId: 'ex-01', order: 2, targetSets: 4, targetVolume: { type: 'reps', min: 8, max: 10 },  restSeconds: 120, plannedWeight: 90  },
  { exId: 'ex-05', order: 3, targetSets: 4, targetVolume: { type: 'reps', min: 8, max: 10 },  restSeconds: 120, plannedWeight: 70  },
  { exId: 'ex-14', order: 4, targetSets: 3, targetVolume: { type: 'reps', min: 10, max: 12 }, restSeconds: 90,  plannedWeight: 24  },
  { exId: 'ex-11', order: 5, targetSets: 3, targetVolume: { type: 'reps', min: 12, max: 15 }, restSeconds: 60,  plannedWeight: 50  },
]

const DAY_B: DayEx[] = [
  { exId: 'ex-04', order: 1, targetSets: 4, targetVolume: { type: 'reps', min: 8, max: 10 },  restSeconds: 120, plannedWeight: 80  },
  { exId: 'ex-06', order: 2, targetSets: 4, targetVolume: { type: 'reps', min: 6, max: 8 },   restSeconds: 120, plannedWeight: 0   },
  { exId: 'ex-10', order: 3, targetSets: 3, targetVolume: { type: 'reps', min: 10, max: 12 }, restSeconds: 90,  plannedWeight: 120 },
  { exId: 'ex-17', order: 4, targetSets: 3, targetVolume: { type: 'reps', min: 10, max: 12 }, restSeconds: 60,  plannedWeight: 40  },
  { exId: 'ex-20', order: 5, targetSets: 3, targetVolume: { type: 'reps', min: 12, max: 15 }, restSeconds: 60,  plannedWeight: 30  },
]

const DAY_C: DayEx[] = [
  { exId: 'ex-02', order: 1, targetSets: 4, targetVolume: { type: 'reps', min: 10, max: 12 }, restSeconds: 90, plannedWeight: 32 },
  { exId: 'ex-07', order: 2, targetSets: 4, targetVolume: { type: 'reps', min: 10, max: 12 }, restSeconds: 90, plannedWeight: 32 },
  { exId: 'ex-13', order: 3, targetSets: 3, targetVolume: { type: 'reps', min: 10, max: 12 }, restSeconds: 90, plannedWeight: 20 },
  { exId: 'ex-15', order: 4, targetSets: 3, targetVolume: { type: 'reps', min: 12, max: 15 }, restSeconds: 60, plannedWeight: 12 },
  { exId: 'ex-22', order: 5, targetSets: 3, targetVolume: { type: 'time', seconds: 45 },      restSeconds: 60, plannedWeight: 0  },
]

const DAY_NAMES = ['День А', 'День Б', 'День В']
const DAY_EXERCISES = [DAY_A, DAY_B, DAY_C]
const CYCLE_LENGTH = 12
const PROG_ID = 'prog-01'

function daysAgo(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  console.log('Seeding...')

  // User
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    create: { id: DEV_USER_ID, firstName: 'Dev', username: 'devuser' },
    update: {},
  })

  // Exercises
  for (const e of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: e.id },
      create: { ...e, createdAt: new Date('2026-01-01') },
      update: {},
    })
  }

  // Program (upsert by id)
  await prisma.program.upsert({
    where: { id: PROG_ID },
    create: {
      id: PROG_ID,
      userId: DEV_USER_ID,
      name: 'Full Body / Месяц 1',
      description: 'Базовая программа на 3 тренировки в неделю. 12 дней цикла.',
      daysPerWeek: 3,
      cycleLength: CYCLE_LENGTH,
      isActive: true,
      createdAt: new Date('2026-01-01'),
    },
    update: {},
  })

  // Templates + exercises
  for (let i = 0; i < CYCLE_LENGTH; i++) {
    const dayType = i % 3
    const templateId = `tmpl-${i + 1}`

    await prisma.workoutTemplate.upsert({
      where: { id: templateId },
      create: { id: templateId, programId: PROG_ID, order: i, name: DAY_NAMES[dayType] },
      update: {},
    })

    for (const d of DAY_EXERCISES[dayType]) {
      const teId = `${templateId}-te-${d.exId}`
      await prisma.workoutTemplateExercise.upsert({
        where: { id: teId },
        create: {
          id: teId,
          templateId,
          exerciseId: d.exId,
          order: d.order,
          targetSets: d.targetSets,
          targetVolume: d.targetVolume,
          restSeconds: d.restSeconds,
          plannedWeight: d.plannedWeight,
        },
        update: {},
      })
    }
  }

  // UserProgramState
  await prisma.userProgramState.upsert({
    where: { userId_programId: { userId: DEV_USER_ID, programId: PROG_ID } },
    create: { userId: DEV_USER_ID, programId: PROG_ID, currentDayIndex: 0 },
    update: {},
  })

  // Workout history
  const baseDate = new Date('2026-05-28')
  const daysBackList = [1, 3, 6, 8, 10, 13, 15, 17, 20, 22, 24, 27, 29, 31, 34, 36, 38]

  for (let i = 0; i < daysBackList.length; i++) {
    const logId = `wlog-${i + 1}`
    const dayIndex = i % CYCLE_LENGTH
    const dayType = dayIndex % 3
    const templateId = `tmpl-${dayType + 1}`
    const dayExercises = DAY_EXERCISES[dayType]
    const startedAt = daysAgo(baseDate, daysBackList[i])
    startedAt.setHours(18, 30, 0, 0)
    const finishedAt = new Date(startedAt.getTime() + 65 * 60 * 1000)

    await prisma.workoutLog.upsert({
      where: { id: logId },
      create: {
        id: logId,
        userId: DEV_USER_ID,
        programId: PROG_ID,
        workoutTemplateId: templateId,
        dayIndex,
        startedAt,
        finishedAt,
        isCompleted: true,
      },
      update: {},
    })

    // Sets for first 3 exercises of the day
    for (let eIdx = 0; eIdx < Math.min(3, dayExercises.length); eIdx++) {
      const d = dayExercises[eIdx]
      const teId = `${templateId}-te-${d.exId}`

      for (let sIdx = 0; sIdx < d.targetSets; sIdx++) {
        const setId = `set-${i}-${eIdx}-${sIdx}`
        const reps = d.targetVolume.type === 'reps' ? d.targetVolume.min + (sIdx % 3) : 0
        const weight = d.plannedWeight + (sIdx % 3) - 1

        await prisma.setLog.upsert({
          where: { id: setId },
          create: {
            id: setId,
            workoutLogId: logId,
            exerciseId: d.exId,
            templateExerciseId: teId,
            setNumber: sIdx + 1,
            weight,
            reps,
            completedAt: new Date(startedAt.getTime() + (eIdx * 15 + sIdx * 3) * 60 * 1000),
          },
          update: {},
        })
      }
    }
  }

  console.log('Seed done ✓')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
