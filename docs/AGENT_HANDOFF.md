# Agent Handoff — GymApp (Telegram Mini App)

> Этот файл — точка входа для нового агента. Читай его ПОСЛЕ `SPEC.md` и `CLAUDE.md`.
> Здесь зафиксировано что уже сделано, что нет, и где находятся важные куски кода.

---

## Текущее состояние: Фазы 1–4 завершены, Фаза 5 следующая

---

## Что сделано

### Фаза 1 — Инициализация ✅
- Next.js 15, TypeScript strict, Tailwind CSS v4
- Zustand v5 + persist, TanStack Query v5
- react-hook-form v7, zod v4, @hookform/resolvers
- @telegram-apps/sdk-react v3
- Gate: `npx tsc --noEmit && npm run lint && npm test` — работает, 0 ошибок

### Фаза 2 — Типы, схемы, mock ✅

**Ключевые типы** (`types/index.ts`):
- `TargetVolume = { type: 'reps'; min; max? } | { type: 'time'; seconds }`
- `WorkoutTemplate.order` — 0-индексированная позиция в цикле
- `Program.cycleLength === templates.length` — инвариант, поддерживается в `services/programs.ts`
- `UserProgramState { userId, programId, currentDayIndex }` — отдельно от `User`
- `SetLog.templateExerciseId` — есть (отличает повтор одного упражнения в сессии)
- `WorkoutLog.programId` и `WorkoutLog.dayIndex` — есть

**Схемы** (`schemas/`):
- `schemas/exercise.ts` — `exerciseSchema`, `ExerciseInput`
- `schemas/program.ts` — `programSchema`, `ProgramInput`
- `schemas/target-volume.ts` — `targetVolumeSchema`

**Сервисы** (`services/`): все async, возвращают `Promise<T>`, работают над mock:
- `services/exercises.ts` — CRUD
- `services/programs.ts` — CRUD программ, шаблонов, упражнений дня; `advanceProgramDay`
- `services/history.ts` — `saveWorkoutLog`, `getWorkoutHistory`, `getWorkoutLog`
- `services/progress.ts` — `getExerciseProgress`, `getStreak`, `getMonthStats`, `getFavoriteMuscleGroup`

**Хуки** (`hooks/`):
- `use-exercises.ts` — `useExercises`, `useExercise`, `useCreateExercise`, `useUpdateExercise`, `useDeleteExercise`
- `use-programs.ts` — `usePrograms`, `useProgram`, `useActiveProgram`, `useActiveProgramState`, `useTemplate`, `useSetActiveProgram`, `useCreateProgram`, `useUpdateProgram`, `useDeleteProgram`, `useAddTemplate`, `useUpdateTemplate`, `useRemoveTemplate`, `useAddExerciseToDay`, `useUpdateDayExercise`, `useRemoveExerciseFromDay`
- `use-history.ts` — `useWorkoutHistory`, `useWorkoutLog`, `useSaveWorkoutLog`
- `use-progress.ts` — `useExerciseProgress`, `useStreak`, `useMonthStats`, `useFavoriteMuscleGroup`
- `use-safe-area.ts` — `useSafeAreaInsets()` → `{ top, bottom }` из Telegram SDK

**Zustand store** (`store/workout-store.ts`):
- persist + localStorage, `partialize` (только нужные поля)
- `onRehydrateStorage` — оживляет Date объекты из JSON
- `restEndsAt: Date | null` — таймер отдыха (НЕ персистится — обнуляется при закрытии)
- `startRest(seconds)` / `stopRest()`
- `finishWorkout(): Promise<void>` — сохраняет в history, двигает `currentDayIndex`, чистит стор
- `lastLogId: string | null` — мост: после `finishWorkout` session-страница читает его и делает `router.push('/workout/summary/${logId}')`
- `restoreSession(): void` — STUB, нужно реализовать в Фазе 5

### Фаза 3 — Layout и навигация ✅

**Route groups**:
- `(main)` — с Header + BottomNav, safe area insets
- `(session)` — без навбара, full-screen (тренировка, формы, профиль)

**Навигация**:
- `components/nav/header.tsx` — логотип + аватарка (инициалы из Telegram), тап → `/profile`
- `components/nav/bottom-nav.tsx` — 3 таба: `/library` | `/workout` | `/progress`, центральный акцентный

**Роуты (session)**:
- `/library/exercises/new` — новое упражнение
- `/library/exercises/[id]` — детальная карточка
- `/library/exercises/[id]/edit` — редактирование
- `/library/programs/new` — новая программа
- `/library/programs/[id]/edit` — редактирование программы
- `/library/programs/[id]/days/[dayId]` — редактор дня (упражнения шаблона)
- `/library/import` — заглушка (Import Hub отложен)
- `/workout/[templateId]/session` — активная тренировка
- `/workout/summary/[logId]` — саммари (читает из history по logId)
- `/profile` — профиль пользователя

### Фаза 4 — Библиотека ✅

**Упражнения**:
- Список с поиском и фильтром по группе мышц (`(main)/library/exercises`)
- CRUD: create / edit / delete — через хуки + `ExerciseForm` (react-hook-form + zod)
- Детальная карточка с превью YouTube

**Программы**:
- Список с кнопкой активации (`(main)/library/programs`)
- CRUD: `ProgramForm` (react-hook-form + zod, выбор дней/нед кнопками 1–7)
- `ProgramDetail` — добавить/удалить день, перейти в редактор дня, активировать

**День программы** (`(session)/library/programs/[id]/days/[dayId]`):
- `ExercisePicker` — поиск + фильтр по мышцам, выбор из всей библиотеки
- `ConfigSheet` — настройка: подходы, тип объёма (reps/time), min/max повторений, секунды, отдых, плановый вес
- Редактирование / удаление упражнений

---

## Что НЕ сделано (Фазы 5–10)

### Фаза 5 — Тренировка ⏳ СЛЕДУЮЩАЯ

**Конкретные задачи:**

1. **`/workout` page** (`app/(main)/workout/page.tsx`) — сейчас использует прямой `getActiveProgram()`, нужно мигрировать на `useActiveProgram()` + `useActiveProgramState()`. Также `currentDayIndex` всегда 0 — нужно передавать реальный из `UserProgramState`.

2. **`restoreSession()`** в `store/workout-store.ts` — сейчас STUB. При маунте нужно проверять persisted state и если `activeWorkout != null` — редиректить на сессию. Логика уже частично есть в `/workout/page.tsx` (проверяет `activeWorkout && template` → `router.replace`), но `restoreSession()` как метод не реализован.

3. **Предыдущий результат** в `active-workout.tsx` — поле "Предыдущий" (readonly). Нужно при инициализации сета брать последний `SetLog` по `exerciseId` из history. Сейчас поля веса/повторений инициализируются из `plannedWeight` / `targetVolume.min`, но не из реальной истории.

4. **`WorkoutSummary`** (`components/screens/workout/workout-summary.tsx`) — базовый компонент уже есть (Trophy, время, подходы, объём). Может потребоваться обогащение: список упражнений с деталями подходов.

5. **Список-вид** (`viewMode === 'list'`) в `active-workout.tsx` — кнопка переключения есть, но list-вид не реализован (рендерит то же что cards-вид). Нужен отдельный layout: все упражнения видны, галочки по мере выполнения.

6. **Framer Motion** — свайпы между упражнениями (drag left/right = next/prev), анимации появления карточек подходов.

7. **`DayPreview`** (`components/screens/workout/day-preview.tsx`) — уже написан, проверить что показывает плановый вес, подходы × повторения корректно.

**Файлы которые трогать в Фазе 5:**
- `app/(main)/workout/page.tsx`
- `store/workout-store.ts` (метод `restoreSession`)
- `components/screens/workout/active-workout.tsx`
- `components/screens/workout/workout-summary.tsx`
- `app/(session)/workout/[templateId]/session/page.tsx`

### Фаза 6 — Прогресс
- Тепловая карта активности (заглушка `activity-heatmap.tsx` есть)
- Графики прогресса по упражнению (заглушка `progress-chart.tsx` есть)
- Personal Records (PR) по каждому упражнению
- Всё читает из `services/history` через `use-history` / `use-progress` хуки

### Фаза 7 — Профиль
- Данные Telegram (имя, аватарка) — уже частично есть в `profile-screen.tsx`
- Переключатель темы (dark/light)
- Статистика (общее кол-во тренировок, недели активности, любимая группа мышц) — уже есть

### Фаза 8 — ИИ фичи
- Генерация описания упражнения — заглушка `handleGenerate` уже есть в `exercise-form.tsx`, нужно заменить на реальный вызов `/api/ai/description`
- Генерация картинки (image-provider) — `/api/ai/image`
- Подсказки прогрессии весов — `/api/ai/progression`
- Все ключи только серверные (env), клиентский код ходит в `/api/ai/*`

### Фаза 9 — Бэкенд
- Neon (Postgres serverless) + Prisma schema
- API routes под каждый сервис
- Замена тел mock-функций в `services/*` на `fetch('/api/...')`
- Telegram auth: HMAC-валидация `initData` на сервере

### Фаза 10 — Деплой
- Vercel + Telegram Bot
- Env переменные (все ключи серверные)

---

## Архитектурные правила (краткая выжимка из CLAUDE.md)

1. Компоненты → только через TanStack Query хуки (`hooks/*`). Прямых вызовов `services/*` в компонентах быть не должно (исключение: workout-page.tsx пока нарушает это — нужно починить в Фазе 5).
2. `cycleLength === templates.length` — поддерживается в `updateProgramTemplates()` в `services/programs.ts`.
3. `currentDayIndex` двигается ТОЛЬКО в `finishWorkout`, формула `(i+1) % cycleLength`.
4. Источник истины по завершённым тренировкам — `services/history`, не Zustand.
5. Safe Area Insets — `useSafeAreaInsets()`, отступы не хардкодить.
6. Gate перед каждым коммитом: `npx tsc --noEmit && npm run lint && npm test`.

---

## Известные технические долги

| Файл | Проблема |
|------|---------|
| `app/(main)/workout/page.tsx` | Прямой вызов `getActiveProgram()`, не хук. `currentDayIndex` захардкожен как `0` |
| `app/(main)/workout/[templateId]/page.tsx` | Прямой вызов `getTemplateById()` + `MOCK_USER` |
| `store/workout-store.ts` | `restoreSession()` — stub, не реализован |
| `components/screens/workout/active-workout.tsx` | List-view не реализован, нет поля "Предыдущий результат" из истории |

---

## Структура ключевых директорий

```
app/
  (main)/          — layout с Header + BottomNav
    library/       — /exercises, /programs
    workout/       — /[templateId] (превью дня)
    progress/
  (session)/       — layout без навбара
    library/programs/[id]/days/[dayId]  — редактор дня
    workout/[templateId]/session        — активная тренировка
    workout/summary/[logId]             — саммари
    profile/

components/
  nav/             — header.tsx, bottom-nav.tsx
  screens/
    library/       — exercise-card, exercise-detail, exercise-form, exercise-picker
                     program-detail, program-form
    workout/       — active-workout, day-preview, no-program-view, program-overview, workout-summary
    progress/      — activity-heatmap, exercise-picker, progress-chart, progress-screen
    profile/       — profile-screen

hooks/             — use-exercises, use-programs, use-history, use-progress, use-safe-area
services/          — exercises, programs, history, progress (все async mock)
schemas/           — exercise, program, target-volume
store/             — workout-store.ts (Zustand + persist)
types/             — index.ts (все типы)
data/              — mock.ts (mock данные)
```
