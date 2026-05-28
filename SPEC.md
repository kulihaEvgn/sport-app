# GymApp — Telegram Mini App

## О проекте

Персональное приложение для трекинга силовых тренировок в формате Telegram Mini App.
Пользователь занимается по циклической программе (например 12 тренировок full body),
логирует реальные веса и повторения, отслеживает прогресс.

---

## Технический стек

```
Next.js 15          App Router
TypeScript          строгий режим
Tailwind CSS        стили
shadcn/ui           UI компоненты
Framer Motion       анимации, свайпы
Zustand             стейт активной тренировки
TanStack Query      серверный стейт (Фаза 9)
Prisma              ORM (Фаза 9)
Neon                Postgres serverless (Фаза 9)
Anthropic API       ИИ генерация контента
@telegram-apps/sdk-react   Telegram Mini App SDK
```

---

## Дизайн

- **Тема:** тёмная (dark-only), не слепит в зале
- **Цветовая схема:** тёмный фон (~#0f0f0f, #1a1a2e), акцент зелёный (#4ade80 / emerald), акцент голубой (cyan), красный для деструктивных действий
- **Стиль:** минималистичный, карточки с rounded-2xl, subtle borders
- **Типографика:** крупные заголовки, чёткая иерархия
- **Навбар:** снизу, 4 вкладки
- **Скриншоты дизайна:** см. папку `docs/design/`

### Цвета групп мышц
- Грудь — красный
- Спина — синий
- Ноги — фиолетовый
- Плечи — оранжевый/янтарный
- Бицепс — розовый
- Трицепс — голубой
- Кор — серый/зелёный

---

## Навигация

Нижний навбар с 4 вкладками:

```
📚 Библиотека | ⚡ Тренировка   |  📈 Прогресс  |  👤 Профиль
```

---

## Сущности (TypeScript типы)

```typescript
// Группа мышц
type MuscleGroup =
  | 'chest' | 'back' | 'legs' | 'shoulders'
  | 'biceps' | 'triceps' | 'core' | 'other'

// Сложность
type Difficulty = 1 | 2 | 3 | 4 | 5

// Упражнение (кирпичик)
interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  difficulty: Difficulty
  equipment: string        // 'Штанга' | 'Гантели' | 'Блок' | 'Тренажёр' | 'Без инвентаря'
  videoUrl?: string        // YouTube ссылка
  description?: string     // ИИ генерация
  imageUrl?: string        // ИИ генерация
  createdAt: Date
}

// Упражнение внутри тренировки (шаблон)
interface WorkoutTemplateExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  order: number
  targetSets: number
  targetReps: string       // '7-8' | '10-12' | '45с'
  restSeconds: number
  needsWarmup: boolean     // P — нужна разминка
  rirTarget: number        // ЗДО — запас до отказа
  plannedWeight?: number   // плановый вес из шаблона
}

// Шаблон тренировки (день программы)
interface WorkoutTemplate {
  id: string
  programId: string
  dayNumber: number        // 1-12
  name: string             // 'День А' | 'День Б'
  exercises: WorkoutTemplateExercise[]
}

// Программа
interface Program {
  id: string
  name: string             // 'Full Body / Месяц 1'
  description?: string
  daysPerWeek: number
  isActive: boolean        // активная программа для тренировок
  templates: WorkoutTemplate[]
  createdAt: Date
}

// Реальный подход (факт)
interface SetLog {
  id: string
  workoutLogId: string
  exerciseId: string
  setNumber: number
  isWarmup: boolean
  weight: number           // реальный вес
  reps: number             // реальные повторения
  rir: number              // реальный ЗДО
  completedAt: Date
}

// Сессия тренировки (факт)
interface WorkoutLog {
  id: string
  userId: string
  workoutTemplateId: string
  startedAt: Date
  finishedAt?: Date
  isCompleted: boolean
  sets: SetLog[]
}

// Пользователь
interface User {
  id: string               // Telegram user_id
  username?: string
  firstName: string
  avatarUrl?: string
  currentDayIndex: number  // текущий день в цикле (0-11)
}
```

---

## Экраны

### ⚡ Тренировка

**Нет активной программы:**
Пустой экран с кнопкой "Выбрать программу" → открывается список программ из Библиотеки → выбрал → стала активной.

**Есть активная программа:**
- Зелёная карточка вверху — название активной программы, дней в неделю
- Список дней цикла (День А, День Б, День В...) с количеством упражнений
- Кнопка "Сменить программу"

**Экран дня (перед стартом):**
- Заголовок "День C / Full Body"
- Зелёный баннер — группа мышц, количество упражнений
- Список упражнений с плановым весом и подходами × повторениями
- Кнопка "Начать тренировку →"

**Активная тренировка:**

Два вида — переключаются кнопкой в хедере:

*Список-вид:* все упражнения видны, галочки по мере выполнения

*Карточки-вид (основной):*
- Хедер: кнопка закрыть, название дня, счётчик "0/4 выполнено", таймер общего времени, переключатель вида
- Прогресс-бар по упражнениям
- Счётчик "1 / 4", тег группы мышц
- Крупное название упражнения
- Целевые подходы × повторения
- Два поля: "Предыдущий" (из истории, readonly) и "Текущий" (кг / повторения)
- Список подходов с вводом веса и повторений для каждого
- ЗДО после каждого подхода
- Таймер отдыха запускается автоматически после подхода
- Кнопки: "← Назад" / "Пропустить" / "Готово ✓"
- Кнопка "Завершить тренировку ✓" внизу

**После завершения:**
- Тренировка помечается выполненной (isCompleted = true)
- Счётчик currentDayIndex сдвигается на следующий день
- Экран итогов — время, упражнения, общий объём

---

### 📚 Библиотека

Два таба вверху: **Упражнения** и **Программы**

**Таб Упражнения:**
- Поиск по названию
- Фильтры: группа мышц, сложность
- Список сгруппированный по группам мышц
- Каждая карточка: аватарка с аббревиатурой и цветом группы, название, точки сложности (●●●○○), инвентарь
- Кнопка "+" → bottom sheet "Добавить упражнение":
    - "Создать" → форма создания
    - "Импортировать" → Import Hub

*Форма создания/редактирования упражнения:*
- Название
- Группа мышц
- Сложность (1-5)
- Инвентарь
- Ссылка на YouTube
- Кнопка "Сгенерировать описание" (Anthropic API)
- Кнопка "Сгенерировать картинку" (image generation API)
- Описание (заполняется ИИ или вручную)

*Детальная карточка упражнения:*
- Картинка / превью YouTube
- Название, группа, сложность, инвентарь
- Описание, техника выполнения
- История использования в тренировках
- Кнопки: Редактировать / Удалить

**Таб Программы:**
- Список программ, активная помечена зелёным
- Кнопка "+" → создать или импортировать программу
- Карточка программы: название, дней в неделю, количество тренировок

*Внутри программы:*
- Список тренировочных дней
- Каждый день: название, количество упражнений
- Редактировать день → список упражнений с плановыми параметрами
- Добавить упражнение в день → выбор из базы упражнений
- Для каждого упражнения в дне: плановый вес, подходы × повторения, отдых, разминка (да/нет), ЗДО цель

**Import Hub:**
Открывается как bottom sheet или отдельный экран.
Контекст определяется откуда вызван (из Упражнений или Программ).

Источники:
- **Notion** — вводишь API key + Database ID → парсим таблицы
- **Obsidian** — загружаешь .md файл → парсим markdown таблицы
- **Excel** — загружаешь .xlsx → SheetJS → маппинг колонок
- **CSV** — загружаешь .csv → papaparse → маппинг колонок

---

### 📈 Прогресс

**Блок активности:**
- Тепловая карта по дням (GitHub-style)
- Текущий streak и лучший streak
- Всего тренировок за месяц

**Блок графика:**
- Выбор упражнения (поиск/список)
- Переключатель периода: 1М / 3М / 6М / Всё
- График роста рабочего веса по датам (line chart)
- Три метрики под графиком: текущий вес, рост в % за период, количество сессий
- Карточка личного рекорда (PR) с датой

---

### 👤 Профиль

- Имя и фото из Telegram (подтягивается автоматически через SDK)
- Активная программа — быстрый доступ
- Статистика: всего тренировок, недель в зале, любимая группа мышц
- Настройки: язык, тема

---

## Сервисный слой (mock → real)

Все запросы данных идут через сервисы, не напрямую из компонентов.
На Фазе 1-8 сервисы возвращают mock данные.
На Фазе 9 меняем реализацию на fetch к API routes — компоненты не трогаем.

```
services/
├── exercises.ts      getExercises, getExercise, createExercise, updateExercise, deleteExercise
├── programs.ts       getPrograms, getProgram, createProgram, updateProgram, deleteProgram, setActiveProgram
├── workout.ts        startWorkout, finishWorkout, logSet, getActiveWorkout
├── history.ts        getWorkoutHistory, getWorkoutLog
├── progress.ts       getExerciseProgress, getStreak, getStats
└── ai.ts             generateDescription, generateImage
```

---

## Zustand Store (активная тренировка)

```typescript
interface WorkoutStore {
  activeWorkout: WorkoutLog | null
  currentExerciseIndex: number
  currentSetNumber: number
  restTimerSeconds: number
  isRestTimerActive: boolean
  viewMode: 'list' | 'cards'

  startWorkout: (templateId: string) => void
  logSet: (set: Omit<SetLog, 'id' | 'workoutLogId'>) => void
  nextExercise: () => void
  prevExercise: () => void
  skipExercise: () => void
  startRestTimer: (seconds: number) => void
  finishWorkout: () => void
  setViewMode: (mode: 'list' | 'cards') => void
}
```

---

## ИИ интеграция (Anthropic API)

**Генерация описания упражнения:**
```
POST /api/ai/generate-exercise
body: { name, muscleGroup, equipment }
response: { description, technique, commonMistakes }
```

**Генерация программы:**
```
POST /api/ai/generate-program
body: { daysPerWeek, goal, level, availableExercises[] }
response: { program: Program }
```

**Подсказка по прогрессии:**
Анализирует последние 3 сессии по упражнению.
Если ЗДО стабильно >= 3 — рекомендует добавить вес.

---

## Фазы разработки

```
Фаза 1   Инициализация — Next.js, Tailwind, shadcn, Framer Motion, Zustand, Telegram SDK
Фаза 2   Типы и mock данные — TypeScript типы, mock файлы, сервисный слой
Фаза 3   Layout и навигация — навбар, роутинг, базовый layout
Фаза 4   Библиотека — Упражнения и Программы, CRUD, Import Hub
Фаза 5   Тренировка — выбор программы, список дней, активная тренировка, свайпы, таймер
Фаза 6   Прогресс — тепловая карта, графики, PR
Фаза 7   Профиль — данные Telegram, статистика, настройки
Фаза 8   ИИ фичи — генерация описания, картинки, подсказки прогрессии
Фаза 9   Бэкенд — Neon, Prisma schema, API routes, замена mock на real, Telegram auth
Фаза 10  Деплой — Vercel, Telegram Bot, переменные окружения
```

---

## Архитектура проекта (Next.js App Router)

```
app/
  layout.tsx              Server Component: шрифты, провайдеры (БЕЗ BottomNav)
  page.tsx                redirect('/workout')

  (main)/                 route group — все экраны С нижним навбаром
    layout.tsx            'use client': BottomNav + TelegramBackButtonSync
    page.tsx              redirect('/workout')

    library/
      layout.tsx          'use client': conditional header + tab switcher
      page.tsx            redirect('/library/exercises')
      exercises/
        page.tsx          список упражнений (поиск, фильтры, группировка)
        new/
          page.tsx        форма создания упражнения
        [id]/
          page.tsx        детальная карточка упражнения
          edit/
            page.tsx      форма редактирования упражнения
      programs/
        page.tsx          список программ
        [id]/
          page.tsx        детальная программы (список дней)
          edit/
            page.tsx      редактирование мета программы
          days/
            [dayId]/
              page.tsx    редактор дня (упражнения, веса, подходы, ЗДО)
      import/
        page.tsx          Import Hub (?context=exercises|programs)

    workout/
      page.tsx            home: выбор программы ИЛИ список дней цикла
      [templateId]/
        page.tsx          preview дня (план + кнопка «Начать тренировку»)

    progress/
      page.tsx            тепловая карта + график (?exercise=<id>&period=3m)

    profile/
      page.tsx            профиль

  (session)/              route group — full screen БЕЗ BottomNav
    layout.tsx            только провайдеры
    workout/
      [templateId]/
        session/
          page.tsx        активная тренировка (Zustand, cards/list view)
      summary/
        page.tsx          итоги после завершения тренировки

components/
  nav/
    bottom-nav.tsx        'use client' — usePathname() + Link
  screens/
    library/              UI-компоненты (не pages): exercise-card, exercise-detail, ...
    workout/
    progress/
    profile/
  tma/                    Telegram SDK hooks и компоненты
```

**Правила навигации:**
- 4 основных вкладки = 4 маршрута: `/library`, `/workout`, `/progress`, `/profile`
- Bottom nav живёт в `(main)/layout.tsx` — отсутствует в `(session)/`
- Вся навигация через роутер (`router.push`, `<Link>`) — никакого `useState` для смены экранов
- Telegram Back Button через `router.back()` — браузерная история сохраняется
- Активная тренировка: state в Zustand store, UI на роуте `/workout/[templateId]/session`
- После завершения тренировки: `router.push('/workout/summary')`, затем `router.push('/workout')`
- Фильтры и выбор (прогресс, импорт) — через `searchParams`, не `useState`

---

## Важные правила для Claude Code

1. **Никогда не редактировать данные напрямую в компонентах** — только через сервисный слой
2. **Все типы в `types/index.ts`** — единый источник правды
3. **Тёмная тема везде** — не добавлять светлые варианты
4. **Mobile-first** — приложение только для мобильных, max-width 430px
5. **Анимации через Framer Motion** — свайпы, переходы, появление карточек
6. **Компоненты маленькие** — один компонент = одна ответственность
7. **Mock данные реалистичные** — использовать реальные названия упражнений, русский язык