# GymApp — Telegram Mini App · SPEC

## О проекте

Персональное приложение для трекинга силовых тренировок в формате Telegram Mini App.
Пользователь занимается по циклической программе (например 12 тренировок full body),
логирует реальные веса и повторения, отслеживает прогресс.

---

## Технический стек

```
Next.js 15               App Router
TypeScript               строгий режим
Tailwind CSS             стили
shadcn/ui                UI компоненты
Framer Motion            анимации, свайпы
Zustand + persist        стейт активной тренировки (восстанавливается после сворачивания)
TanStack Query           ВЕСЬ дата-слой с Фазы 1 (над mock, затем над API)
react-hook-form          управление формами
zod                      схемы валидации
@hookform/resolvers      связка react-hook-form + zod
Prisma                   ORM (Фаза 9)
Neon                     Postgres serverless (Фаза 9)
Anthropic API            ИИ генерация ТЕКСТА (описания, программы)
<image-provider>         ИИ генерация картинок (отдельный провайдер, см. раздел ИИ)
@telegram-apps/sdk-react Telegram Mini App SDK
```

> **Принцип дата-слоя:** TanStack Query подключается с Фазы 1, а не Фазы 9. Все сервисы
> асинхронны (возвращают `Promise`) уже на mock-этапе, поэтому компоненты сразу пишутся
> с `isLoading` / `isError`. Переход на Фазе 9 = замена тела функции в сервисе, без правок UI.

---

## Дизайн

- **Тема:** тёмная и светлая. Подхватывается автоматически из Telegram (`useThemeParams` из SDK). Пользователь может переключить вручную в Профиле.
- **Цветовая схема:** тёмный фон (~#0f0f0f, #1a1a2e), акцент зелёный (#4ade80 / emerald), акцент голубой (cyan), красный для деструктивных действий
- **Стиль:** минималистичный, карточки с rounded-2xl, subtle borders
- **Типографика:** крупные заголовки, чёткая иерархия
- **Скриншоты дизайна:** см. папку `docs/design/`

### Цвета групп мышц
- Грудь — красный
- Спина — синий
- Ноги — фиолетовый
- Плечи — оранжевый
- Бицепс — розовый
- Трицепс — голубой
- Кор — серый/зелёный

---

## Навигация

**Нижний навбар — 3 вкладки:**
```
📚 Библиотека  |  ⚡ Тренировка  |  📈 Прогресс
```
Центральная кнопка "Тренировка" — большая, выпуклая, акцентная.

**Хедер — иконка профиля справа** присутствует на каждом экране в `(main)` layout.
Тап на аватарку → открывается экран профиля.

---

## Типы данных (TypeScript)

```typescript
// Группа мышц
type MuscleGroup =
  | 'chest' | 'back' | 'legs' | 'shoulders'
  | 'biceps' | 'triceps' | 'core' | 'other'

// Целевой объём подхода: повторы ИЛИ время — без смешения в строке
type TargetVolume =
  | { type: 'reps'; min: number; max?: number }   // 7-8 повторений → { min: 7, max: 8 }
  | { type: 'time'; seconds: number }             // 45с → { seconds: 45 }

// Упражнение (кирпичик)
interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string        // 'Штанга' | 'Гантели' | 'Блок' | 'Тренажёр' | 'Без инвентаря'
  videoUrl?: string        // YouTube ссылка
  description?: string     // ИИ генерация (текст)
  imageUrl?: string        // ИИ генерация (картинка, отдельный провайдер)
  createdAt: Date
}

// Упражнение внутри тренировки (шаблон)
interface WorkoutTemplateExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  order: number
  targetSets: number
  targetVolume: TargetVolume   // вместо строки 'targetReps'
  restSeconds: number
  plannedWeight?: number
}

// Шаблон тренировки (день программы)
interface WorkoutTemplate {
  id: string
  programId: string
  order: number            // позиция дня в цикле (0..cycleLength-1) — источник порядка
  name: string             // 'День А' | 'День Б'
  exercises: WorkoutTemplateExercise[]
}

// Программа. ЦИКЛ — свойство программы, не пользователя.
interface Program {
  id: string
  name: string
  description?: string
  daysPerWeek: number
  cycleLength: number      // длина цикла === templates.length (инвариант)
  isActive: boolean
  templates: WorkoutTemplate[]  // упорядочены по order
  createdAt: Date
}

// Прогресс пользователя ПО КОНКРЕТНОЙ программе.
// Вынесено из User: индекс всегда валидируется против program.cycleLength
// и не «протекает» при смене программы.
interface UserProgramState {
  userId: string
  programId: string
  currentDayIndex: number  // 0..cycleLength-1
}

// Реальный подход (факт)
interface SetLog {
  id: string
  workoutLogId: string
  exerciseId: string                 // для агрегации в графике прогресса
  templateExerciseId: string         // различает повтор одного упражнения в одной сессии
  setNumber: number
  weight: number
  reps: number
  completedAt: Date
}

// Сессия тренировки (факт)
interface WorkoutLog {
  id: string
  userId: string
  programId: string
  workoutTemplateId: string
  dayIndex: number          // снимок currentDayIndex на момент старта
  startedAt: Date
  finishedAt?: Date
  isCompleted: boolean
  sets: SetLog[]
}

// Пользователь — БЕЗ currentDayIndex (перенесён в UserProgramState)
interface User {
  id: string               // Telegram user_id (валидируется через initData HMAC на сервере)
  username?: string
  firstName: string
  avatarUrl?: string
}
```

### Инварианты цикла

- `program.cycleLength === program.templates.length`
- `currentDayIndex` сдвигается **атомарно только в `finishWorkout`**, по формуле
  `(currentDayIndex + 1) % cycleLength`. Старт/пропуск/отмена тренировки индекс НЕ двигают.
- Текущий шаблон дня = `templates.find(t => t.order === state.currentDayIndex)`.

### Схемы валидации (zod)

```typescript
// schemas/exercise.ts
const exerciseSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  muscleGroup: z.enum(['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'other']),
  equipment: z.string().min(1, 'Обязательное поле'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
})

// schemas/program.ts
const programSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  daysPerWeek: z.number().min(1).max(7),
})

// schemas/target-volume.ts — целевой объём подхода
const targetVolumeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('reps'), min: z.number().min(1), max: z.number().min(1).optional() }),
  z.object({ type: z.literal('time'), seconds: z.number().min(1) }),
])
```

---

## Экраны

### ⚡ Тренировка

**Нет активной программы:**
Пустой экран с кнопкой "Выбрать программу" → список программ из Библиотеки → выбрал → стала активной.

**Есть активная программа:**
- Зелёная карточка вверху — название, дней в неделю, количество тренировок
- Большая кнопка "Следующая: День А"
- Список всех дней цикла с тегами групп мышц и количеством упражнений
- Кнопка "Сменить программу"

**Превью дня (перед стартом):**
- Заголовок дня + название программы
- Баннер — группы мышц, количество упражнений
- Список упражнений с плановым весом и подходами × повторениями
- Кнопка "Начать тренировку →"

**Активная тренировка — два вида, переключаются кнопкой в хедере:**

*Карточки-вид (основной):*
- Хедер: кнопка закрыть, название дня, счётчик "0/4 выполнено", таймер полного времени (запускается сразу, идёт непрерывно), переключатель вида
- Прогресс-бар по упражнениям
- Счётчик "1 / 4", тег группы мышц
- Крупное название упражнения
- Целевые подходы × повторения
- Два поля: "Предыдущий" (из истории, readonly) и "Текущий" (кг / повторения)
- Список подходов с вводом веса и повторений
- Кнопки: "← Назад" / "Пропустить" / "Готово ✓"
- Кнопка "Завершить тренировку ✓" внизу

*Список-вид:*
- Все упражнения видны, галочки по мере выполнения

**После завершения:**
- `WorkoutLog.isCompleted = true`, `finishedAt` проставляется
- `finishWorkout` персистит лог в хранилище истории (`services/history` — на Фазах 1-8
  это персистентный mock, на Фазе 9 — БД). Только после успешной записи:
- `currentDayIndex` сдвигается: `(currentDayIndex + 1) % cycleLength`
- Активная сессия в Zustand очищается (persist-ключ удаляется)
- Переход на `/workout/summary/[logId]` — summary читает лог **из истории по logId**,
  не из Zustand (стор уже очищен)

> **Прерванная тренировка:** если юзер закрыл приложение на середине — сессия живёт в
> persisted-Zustand и восстанавливается при следующем заходе (см. раздел Zustand Store).
> Индекс цикла НЕ двигается, пока тренировка не завершена явно.

---

### 📚 Библиотека

Два таба: **Упражнения** и **Программы** (отдельные URL, переключатель в layout)

**Упражнения `/library/exercises`:**
- Поиск по названию
- Фильтр по группе мышц
- Список сгруппированный по группам мышц
- Каждая карточка: аватарка с аббревиатурой и цветом группы, название, инвентарь
- Кнопка "+" → bottom sheet:
  - "Создать" → форма создания
  - "Импортировать" → Import Hub

*Форма создания/редактирования:*
- Название
- Группа мышц
- Инвентарь
- Ссылка на YouTube
- Кнопка "Сгенерировать описание" (Anthropic API)
- Кнопка "Сгенерировать картинку" (image generation API)
- Описание (заполняется ИИ или вручную)
- Управление через `react-hook-form` + `zod`

*Детальная карточка упражнения:*
- Картинка / превью YouTube
- Название, группа, инвентарь, описание
- Кнопки: Редактировать / Удалить

**Программы `/library/programs`:**
- Список программ, активная помечена зелёным
- Кнопка "+" → создать или импортировать

*Внутри программы:*
- Список тренировочных дней
- Каждый день: название, количество упражнений, теги групп мышц
- Редактировать день → список упражнений с параметрами
- Добавить упражнение → выбор из базы упражнений
- Для каждого упражнения: плановый вес, подходы × повторения, отдых

**Import Hub `/library/import?context=exercises|programs`:**
- Один экран, контекст определяется параметром `?context`
- Источники:
  - **Notion** — API key + Database ID → парсим таблицы
  - **Obsidian** — загрузка .md файла → парсим markdown таблицы
  - **Excel** — загрузка .xlsx → SheetJS → маппинг колонок
  - **CSV** — загрузка .csv → papaparse → маппинг колонок

---

### 📈 Прогресс

**Блок активности:**
- Тепловая карта по дням (GitHub-style)
- Текущий streak и лучший streak
- Всего тренировок за месяц

**Блок графика:**
- Выбор упражнения
- Переключатель периода: 1М / 3М / 6М / Всё (через `?exercise=<id>&period=3m` в URL)
- График роста рабочего веса по датам
- Метрики: текущий вес, рост в % за период, количество сессий
- Карточка личного рекорда (PR) с датой

---

### 👤 Профиль

Открывается по тапу на аватарку в хедере (fullscreen, без navbar).

- Имя и фото из Telegram (автоматически через SDK)
- Активная программа — быстрый доступ
- Статистика: всего тренировок, недель в зале, любимая группа мышц
- Настройки: тема (тёмная/светлая)

---

## App Router архитектура

```
app/
  layout.tsx                         # Server Component: шрифты, провайдеры
  page.tsx                           # redirect('/workout')

  (main)/                            # С BottomNav + Header
    layout.tsx                       # 'use client': Header (аватарка) + BottomNav + TelegramBackButtonSync
    
    workout/
      page.tsx                       # выбор программы ИЛИ список дней цикла
      [templateId]/
        page.tsx                     # превью дня — план + кнопка «Начать тренировку»

    library/
      layout.tsx                     # 'use client': tab switcher Упражнения/Программы
      page.tsx                       # redirect('/library/exercises')
      exercises/
        page.tsx                     # список упражнений
      programs/
        page.tsx                     # список программ
        [id]/
          page.tsx                   # детали программы (список дней)

    progress/
      page.tsx                       # тепловая карта + график (?exercise=<id>&period=3m)

  (session)/                         # Fullscreen, БЕЗ BottomNav
    layout.tsx                       # только провайдеры

    profile/
      page.tsx                       # профиль

    workout/
      [templateId]/
        session/
          page.tsx                   # активная тренировка (Zustand, cards/list view)
      summary/
        [logId]/
          page.tsx                   # итоги тренировки (из БД по logId)

    library/
      exercises/
        new/
          page.tsx                   # форма создания упражнения
        [id]/
          page.tsx                   # детальная карточка упражнения
          edit/
            page.tsx                 # форма редактирования
      programs/
        new/
          page.tsx                   # форма создания программы
        [id]/
          edit/
            page.tsx                 # редактирование программы
          days/
            [dayId]/
              page.tsx               # редактор дня
      import/
        page.tsx                     # Import Hub (?context=exercises|programs)
```

### Ключевые решения

**Два route group:**
- `(main)` — экраны с Header + BottomNav
- `(session)` — fullscreen без навигации (активная тренировка, формы, детали, профиль)

**Вложенные layout:**
- `(main)/layout.tsx` — рендерит `<Header />` (аватарка профиля справа) + `<BottomNav />` + синхронизирует Telegram Back Button
- `(main)/library/layout.tsx` — tab switcher Упражнения/Программы, контент через `{children}`
- `(session)/layout.tsx` — чистый layout, только провайдеры

**URL как стейт:**
- `/progress?exercise=<id>&period=3m` — выбранное упражнение и период
- `/library/import?context=exercises` — Import Hub знает откуда вызван
- `/workout/summary/[logId]` — итоги из БД, не из Zustand

**Формы:**
- Все формы — `'use client'` компоненты
- `react-hook-form` + `zod` + `@hookform/resolvers`
- Страницы-обёртки остаются Server Components

---

## Компоненты — feature-based структура

```
components/
  ui/                                # shadcn + атомарные примитивы
  exercises/
    exercise-card.tsx                # карточка (библиотека, редактор дня, тренировка)
    exercise-list.tsx                # список с группировкой по мышцам
    exercise-form.tsx                # форма создания/редактирования ('use client')
    exercise-avatar.tsx              # аватарка с аббревиатурой и цветом группы
    exercise-detail.tsx              # детальная карточка
  programs/
    program-card.tsx
    program-form.tsx                 # ('use client')
    day-editor.tsx                   # редактор дня
    exercise-picker.tsx              # выбор упражнения из базы
  workout/
    day-preview.tsx                  # превью дня перед стартом
    session-cards.tsx                # карточки-вид (свайп)
    session-list.tsx                 # список-вид
    set-logger.tsx                   # логирование подхода (вес, повторения)
    workout-timer.tsx                # таймер полного времени тренировки
    workout-summary.tsx              # итоги тренировки
  progress/
    heatmap.tsx                      # тепловая карта активности
    exercise-chart.tsx               # график роста веса
    pr-card.tsx                      # карточка личного рекорда
  import/
    import-hub.tsx                   # выбор источника
    notion-importer.tsx
    obsidian-importer.tsx
    excel-importer.tsx
    csv-importer.tsx
  nav/
    bottom-nav.tsx                   # 'use client' — usePathname() + Link
    header.tsx                       # 'use client' — аватарка + навигация в профиль
  tma/
    telegram-provider.tsx
    use-telegram-user.ts
    back-button-sync.tsx
```

**Правило:** страницы в `app/` — тонкие, только собирают компоненты. Вся логика и UI в `components/`.

---

## Сервисный слой (mock → real)

```
services/
  exercises.ts    # getExercises, getExercise, createExercise, updateExercise, deleteExercise
  programs.ts     # getPrograms, getProgram, createProgram, updateProgram, deleteProgram,
                  #   setActiveProgram, getActiveProgramState (UserProgramState)
  workout.ts      # startWorkout, finishWorkout, logSet, getActiveWorkout
  history.ts      # getWorkoutHistory, getWorkoutLog — ПЕРСИСТИТ завершённые логи
                  #   (mock-этап: localStorage/CloudStorage; Фаза 9: БД)
  progress.ts     # getExerciseProgress, getStreak, getStats
  ai.ts           # generateDescription, generateImage — бьют ТОЛЬКО во внутренние
                  #   /api/ai/* routes (ключи провайдеров серверные, не в браузере)
```

**Все сервисы асинхронны с Фазы 1** — сигнатуры возвращают `Promise<T>`. На Фазах 1-8
тело — mock (с эмуляцией задержки), на Фазе 9 — `fetch` к API routes. Сигнатуры и типы
не меняются, поэтому компоненты не трогаем.

**TanStack Query — поверх сервисов с Фазы 1.** Каждый сервис обёрнут хуками
(`useExercises`, `useActiveProgram`, мутации с инвалидацией). UI сразу пишется с
`isLoading` / `isError`, переход на сеть на Фазе 9 прозрачен.

**`history.ts` персистит на mock-этапе** — иначе summary (Фаза 5) и прогресс (Фаза 6)
нечем кормить между перезагрузками. Завершённые `WorkoutLog` сохраняются в Telegram
CloudStorage или localStorage.

---

## Zustand Store (активная тренировка)

Стор активной тренировки **персистится** (`persist` middleware → Telegram CloudStorage
или localStorage). Mini App легко сворачивается / перезагружает WebView, а тренировка
идёт 40-60 мин — без персиста данные теряются. При маунте сессия восстанавливается.

```typescript
interface WorkoutStore {
  activeWorkout: WorkoutLog | null
  currentExerciseIndex: number
  currentSetNumber: number
  workoutStartedAt: Date | null      // полное время тренировки

  // Таймер отдыха между подходами (restSeconds из шаблона)
  restEndsAt: Date | null            // null = отдых не идёт
  viewMode: 'list' | 'cards'

  // Статус сетевых операций (на Фазе 9 logSet станет async)
  logStatus: 'idle' | 'saving' | 'error'

  // Действия
  startWorkout: (templateId: string) => void
  logSet: (set: Omit<SetLog, 'id' | 'workoutLogId'>) => void
  nextExercise: () => void
  prevExercise: () => void
  skipExercise: () => void
  finishWorkout: () => Promise<void>          // пишет в history, затем чистит стор
  startRest: (seconds: number) => void
  stopRest: () => void
  setViewMode: (mode: 'list' | 'cards') => void

  // Восстановление прерванной сессии при заходе в приложение
  restoreSession: () => void
}
```

> `finishWorkout` — async: сначала персист в `services/history`, при успехе сдвиг
> `currentDayIndex` и очистка persisted-стора. При ошибке `logStatus = 'error'`,
> сессия не теряется.

---

## ИИ интеграция (Anthropic API)

**Текст (Anthropic API):**
```
POST /api/ai/generate-exercise
body:     { name, muscleGroup, equipment }
response: { description, technique, commonMistakes }

POST /api/ai/generate-program
body:     { daysPerWeek, goal, level, availableExercises[] }
response: { program: Program }
```

**Картинки (отдельный провайдер):** у Anthropic API нет генерации изображений.
`generateImage` ходит в отдельный image-провайдер через свой route:
```
POST /api/ai/generate-image
body:     { name, muscleGroup, equipment }
response: { imageUrl }
```

> **Безопасность ключей:** все ключи провайдеров — только серверные (env на Vercel).
> `services/ai.ts` бьёт во внутренние `/api/ai/*`, ключи НИКОГДА не попадают в браузер.

**Подсказка прогрессии:** анализирует последние 3 сессии по упражнению (из `history`).
Если вес стабильный и повторения в верхней границе `targetVolume` (`type: 'reps'`,
достигнут `max`) — рекомендует добавить вес.

---

## Фазы разработки

```
Фаза 1   Инициализация — Next.js 15, Tailwind, shadcn, Framer Motion, Zustand+persist,
         TanStack Query (с фазы 1), Telegram SDK
Фаза 2   Типы, схемы, mock — TS типы, zod схемы, async-сервисы (Promise) над mock,
         персистентный history-mock, Query-хуки
Фаза 3   Layout и навигация — (main)/(session) route groups, Header, BottomNav, роутинг
Фаза 4   Библиотека — Упражнения и Программы, CRUD, react-hook-form, Import Hub
Фаза 5   Тренировка — выбор программы, превью дня, активная тренировка с восстановлением
         прерванной сессии, таймер отдыха, свайпы
Фаза 6   Прогресс — тепловая карта, графики, PR (поверх персистентной истории)
Фаза 7   Профиль — данные Telegram, статистика, настройки темы
Фаза 8   ИИ фичи — генерация описания (Anthropic), картинки (image-провайдер),
         подсказки прогрессии
Фаза 9   Бэкенд — Neon, Prisma schema, API routes, замена тела mock-сервисов на fetch,
         Telegram auth с валидацией initData (HMAC) на сервере
Фаза 10  Деплой — Vercel, Telegram Bot, переменные окружения (все ключи серверные)
```

---

## Правила для Claude Code

1. Все запросы данных — только через сервисный слой (async, `Promise`), обёрнутый
   TanStack Query. Компоненты не дёргают сервисы напрямую, только через Query-хуки
2. Все типы — в `types/index.ts`, все zod схемы — в `schemas/`
3. Обе темы (тёмная/светлая) — все компоненты через Tailwind `dark:` классы
4. Mobile-first — только мобильные, max-width 430px
5. Анимации через Framer Motion — свайпы, переходы, появление карточек
6. Компоненты маленькие — один компонент, одна ответственность
7. Mock данные реалистичные — реальные названия упражнений, русский язык
8. Активная тренировка — Zustand с `persist`, обязательное восстановление сессии при
   маунте. Индекс цикла двигается только при явном завершении
9. Источник истины: завершённые тренировки — только из `services/history`
   (не из Zustand). Summary и Прогресс читают историю, не активный стор
10. Дата-флоу клиентский (TanStack Query). Серверные компоненты — тонкие шеллы, без
    fetch к сервисам, которые читают localStorage/CloudStorage
11. Ключи AI-провайдеров — только серверные (env). `services/ai.ts` ходит во внутренние
    `/api/ai/*`. Ключи никогда не в браузере
12. Safe Area Insets — `useSafeAreaInsets()` из `@telegram-apps/sdk-react` в обоих
    layout. Никогда не хардкодить отступы сверху и снизу

```tsx
// (main)/layout.tsx и (session)/layout.tsx
const { top, bottom } = useSafeAreaInsets()
<div style={{ paddingTop: top, paddingBottom: bottom }}>
  {children}
</div>
```