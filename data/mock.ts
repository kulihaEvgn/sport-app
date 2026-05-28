import type { Exercise, Program, WorkoutLog, User } from '@/types'

// ── Exercises ─────────────────────────────────────────────────────────────

export const MOCK_EXERCISES: Exercise[] = [
  // Грудь
  {
    id: 'ex-01', name: 'Жим штанги лёжа', muscleGroup: 'chest',
    difficulty: 3, equipment: 'Штанга',
    description: 'Базовое упражнение для грудных мышц. Лёжа на скамье, хват чуть шире плеч.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-02', name: 'Жим гантелей лёжа', muscleGroup: 'chest',
    difficulty: 2, equipment: 'Гантели',
    description: 'Жим гантелей лёжа с большей амплитудой по сравнению со штангой.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-03', name: 'Разводка гантелей лёжа', muscleGroup: 'chest',
    difficulty: 2, equipment: 'Гантели',
    description: 'Изолирующее упражнение для грудных мышц. Акцент на растяжение.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-04', name: 'Жим штанги в наклоне', muscleGroup: 'chest',
    difficulty: 3, equipment: 'Штанга',
    description: 'Жим под углом 30-45°. Акцент на верхнюю часть грудных.',
    createdAt: new Date('2026-01-01'),
  },
  // Спина
  {
    id: 'ex-05', name: 'Тяга штанги в наклоне', muscleGroup: 'back',
    difficulty: 4, equipment: 'Штанга',
    description: 'Базовое упражнение для широчайших и ромбовидных мышц.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-06', name: 'Подтягивания широким хватом', muscleGroup: 'back',
    difficulty: 4, equipment: 'Без инвентаря',
    description: 'Лучшее упражнение для широчайших. Хват чуть шире плеч.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-07', name: 'Тяга гантели одной рукой', muscleGroup: 'back',
    difficulty: 2, equipment: 'Гантели',
    description: 'Акцентирует широчайшие и ромбовидные. Опора на скамью.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-08', name: 'Горизонтальная тяга в блоке', muscleGroup: 'back',
    difficulty: 2, equipment: 'Блок',
    description: 'Тяга сидя к поясу. Хорошо прорабатывает середину спины.',
    createdAt: new Date('2026-01-01'),
  },
  // Ноги
  {
    id: 'ex-09', name: 'Приседания со штангой', muscleGroup: 'legs',
    difficulty: 4, equipment: 'Штанга',
    description: 'Король упражнений. Штанга на трапеции, спина прямая, колени по линии носков.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-10', name: 'Жим ногами', muscleGroup: 'legs',
    difficulty: 2, equipment: 'Тренажёр',
    description: 'Хорошая альтернатива приседаниям. Широкая постановка ног — больше бицепс бедра.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-11', name: 'Разгибания ног в тренажёре', muscleGroup: 'legs',
    difficulty: 1, equipment: 'Тренажёр',
    description: 'Изолирующее упражнение для квадрицепсов.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-12', name: 'Сгибания ног в тренажёре', muscleGroup: 'legs',
    difficulty: 1, equipment: 'Тренажёр',
    description: 'Изолирующее упражнение для бицепса бедра.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-13', name: 'Выпады с гантелями', muscleGroup: 'legs',
    difficulty: 3, equipment: 'Гантели',
    description: 'Развивают баланс и проработку каждой ноги по отдельности.',
    createdAt: new Date('2026-01-01'),
  },
  // Плечи
  {
    id: 'ex-14', name: 'Жим гантелей сидя', muscleGroup: 'shoulders',
    difficulty: 3, equipment: 'Гантели',
    description: 'Основной жим для плеч. Больший контроль по сравнению со штангой.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-15', name: 'Разводка гантелей в стороны', muscleGroup: 'shoulders',
    difficulty: 2, equipment: 'Гантели',
    description: 'Изоляция средней дельты. Небольшой вес, контроль движения.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-16', name: 'Тяга штанги к подбородку', muscleGroup: 'shoulders',
    difficulty: 3, equipment: 'Штанга',
    description: 'Прорабатывает передний и средний пучки дельт и трапеции.',
    createdAt: new Date('2026-01-01'),
  },
  // Бицепс
  {
    id: 'ex-17', name: 'Подъём штанги на бицепс', muscleGroup: 'biceps',
    difficulty: 2, equipment: 'Штанга',
    description: 'Классическое базовое упражнение для бицепса.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-18', name: 'Молоток', muscleGroup: 'biceps',
    difficulty: 2, equipment: 'Гантели',
    description: 'Нейтральный хват. Акцент на плечевую и плечелучевую мышцы.',
    createdAt: new Date('2026-01-01'),
  },
  // Трицепс
  {
    id: 'ex-19', name: 'Французский жим', muscleGroup: 'triceps',
    difficulty: 3, equipment: 'Штанга',
    description: 'Лёжа на скамье, штанга опускается за голову. Длинная головка трицепса.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-20', name: 'Разгибания на блоке', muscleGroup: 'triceps',
    difficulty: 1, equipment: 'Блок',
    description: 'Хорошая изоляция трицепса. Локти прижаты к корпусу.',
    createdAt: new Date('2026-01-01'),
  },
  // Кор
  {
    id: 'ex-21', name: 'Скручивания', muscleGroup: 'core',
    difficulty: 1, equipment: 'Без инвентаря',
    description: 'Базовое упражнение для прямой мышцы живота.',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-22', name: 'Планка', muscleGroup: 'core',
    difficulty: 2, equipment: 'Без инвентаря',
    description: 'Статическое упражнение для всего корпуса. Не опускай таз!',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ex-23', name: 'Пресс на тренажёре', muscleGroup: 'core',
    difficulty: 2, equipment: 'Блок',
    description: 'Скручивания с отягощением. Хорошая нагрузка на прямую мышцу.',
    createdAt: new Date('2026-01-01'),
  },
]

const ex = (id: string) => MOCK_EXERCISES.find(e => e.id === id)!

// ── Program ──────────────────────────────────────────────────────────────

const DAY_A_EXERCISES = [
  { ex: ex('ex-09'), order: 1, targetSets: 4, targetReps: '6-8', restSeconds: 180, needsWarmup: true,  rirTarget: 2, plannedWeight: 100 },
  { ex: ex('ex-01'), order: 2, targetSets: 4, targetReps: '8-10', restSeconds: 120, needsWarmup: true, rirTarget: 2, plannedWeight: 90 },
  { ex: ex('ex-05'), order: 3, targetSets: 4, targetReps: '8-10', restSeconds: 120, needsWarmup: true, rirTarget: 2, plannedWeight: 70 },
  { ex: ex('ex-14'), order: 4, targetSets: 3, targetReps: '10-12', restSeconds: 90,  needsWarmup: false, rirTarget: 2, plannedWeight: 24 },
  { ex: ex('ex-11'), order: 5, targetSets: 3, targetReps: '12-15', restSeconds: 60,  needsWarmup: false, rirTarget: 1, plannedWeight: 50 },
]

const DAY_B_EXERCISES = [
  { ex: ex('ex-04'), order: 1, targetSets: 4, targetReps: '8-10', restSeconds: 120, needsWarmup: true, rirTarget: 2, plannedWeight: 80 },
  { ex: ex('ex-06'), order: 2, targetSets: 4, targetReps: '6-8',  restSeconds: 120, needsWarmup: true, rirTarget: 2, plannedWeight: 0 },
  { ex: ex('ex-10'), order: 3, targetSets: 3, targetReps: '10-12', restSeconds: 90, needsWarmup: false, rirTarget: 2, plannedWeight: 120 },
  { ex: ex('ex-17'), order: 4, targetSets: 3, targetReps: '10-12', restSeconds: 60, needsWarmup: false, rirTarget: 2, plannedWeight: 40 },
  { ex: ex('ex-20'), order: 5, targetSets: 3, targetReps: '12-15', restSeconds: 60, needsWarmup: false, rirTarget: 1, plannedWeight: 30 },
]

const DAY_C_EXERCISES = [
  { ex: ex('ex-02'), order: 1, targetSets: 4, targetReps: '10-12', restSeconds: 90, needsWarmup: false, rirTarget: 2, plannedWeight: 32 },
  { ex: ex('ex-07'), order: 2, targetSets: 4, targetReps: '10-12', restSeconds: 90, needsWarmup: false, rirTarget: 2, plannedWeight: 32 },
  { ex: ex('ex-13'), order: 3, targetSets: 3, targetReps: '10-12', restSeconds: 90, needsWarmup: false, rirTarget: 2, plannedWeight: 20 },
  { ex: ex('ex-15'), order: 4, targetSets: 3, targetReps: '12-15', restSeconds: 60, needsWarmup: false, rirTarget: 1, plannedWeight: 12 },
  { ex: ex('ex-22'), order: 5, targetSets: 3, targetReps: '45с',   restSeconds: 60, needsWarmup: false, rirTarget: 0, plannedWeight: 0 },
]

function makeTemplateExercises(
  dayExercises: typeof DAY_A_EXERCISES,
  templateId: string,
) {
  return dayExercises.map((d) => ({
    id: `${templateId}-te-${d.ex.id}`,
    exerciseId: d.ex.id,
    exercise: d.ex,
    order: d.order,
    targetSets: d.targetSets,
    targetReps: d.targetReps,
    restSeconds: d.restSeconds,
    needsWarmup: d.needsWarmup,
    rirTarget: d.rirTarget,
    plannedWeight: d.plannedWeight,
  }))
}

const DAY_NAMES = ['День А', 'День Б', 'День В']
const DAY_EXERCISES = [DAY_A_EXERCISES, DAY_B_EXERCISES, DAY_C_EXERCISES]

export const MOCK_PROGRAM: Program = {
  id: 'prog-01',
  name: 'Full Body / Месяц 1',
  description: 'Базовая программа на 3 тренировки в неделю. 12 дней цикла.',
  daysPerWeek: 3,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  templates: Array.from({ length: 12 }, (_, i) => {
    const dayType = i % 3
    const templateId = `tmpl-${i + 1}`
    return {
      id: templateId,
      programId: 'prog-01',
      dayNumber: i + 1,
      name: DAY_NAMES[dayType],
      exercises: makeTemplateExercises(DAY_EXERCISES[dayType], templateId),
    }
  }),
}

export const MOCK_PROGRAMS: Program[] = [MOCK_PROGRAM]

// ── Workout history ───────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date('2026-05-28')
  d.setDate(d.getDate() - n)
  return d
}

export const MOCK_WORKOUT_LOGS: WorkoutLog[] = [
  // Most recent workouts (last 6 weeks, Mon/Wed/Fri pattern)
  ...[1, 3, 6, 8, 10, 13, 15, 17, 20, 22, 24, 27, 29, 31, 34, 36, 38].map((daysBack, i) => {
    const dayType = i % 3
    const templateId = `tmpl-${(dayType) + 1}`
    const template = MOCK_PROGRAM.templates[dayType]
    const startedAt = daysAgo(daysBack)
    startedAt.setHours(18, 30, 0, 0)
    const finishedAt = new Date(startedAt.getTime() + 65 * 60 * 1000)

    return {
      id: `wlog-${i + 1}`,
      userId: 'usr-01',
      workoutTemplateId: templateId,
      startedAt,
      finishedAt,
      isCompleted: true,
      sets: template.exercises.slice(0, 3).flatMap((te, eIdx) =>
        Array.from({ length: te.targetSets }, (_, sIdx) => ({
          id: `set-${i}-${eIdx}-${sIdx}`,
          workoutLogId: `wlog-${i + 1}`,
          exerciseId: te.exerciseId,
          setNumber: sIdx + 1,
          isWarmup: sIdx === 0 && te.needsWarmup,
          weight: (te.plannedWeight ?? 0) + Math.floor(Math.random() * 5 - 2),
          reps: parseInt(te.targetReps.split('-')[0]) + Math.floor(Math.random() * 3),
          rir: te.rirTarget,
          completedAt: new Date(startedAt.getTime() + (eIdx * 15 + sIdx * 3) * 60 * 1000),
        })),
      ),
    } satisfies WorkoutLog
  }),
]

// ── User ─────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'usr-01',
  username: 'gymuser',
  firstName: 'Алексей',
  currentDayIndex: 0,
}
