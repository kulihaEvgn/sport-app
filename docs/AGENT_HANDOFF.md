# Agent Handoff — GymApp (Telegram Mini App)

> Этот файл — точка входа для нового агента. Читай его ПОСЛЕ `SPEC.md` и `CLAUDE.md`.
> Здесь зафиксировано что уже сделано, что нет, и где находятся важные куски кода.

---

## Текущее состояние: Фазы 1–6 завершены, Фаза 7 следующая

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

### Фаза 5 — Тренировка ✅

- `workout/page.tsx` — мигрирован на `useActiveProgram()` + `useActiveProgramState()`, передаёт реальный `currentDayIndex`
- `workout/[templateId]/page.tsx` — мигрирован на `useTemplate()` хук
- `services/history.ts` — добавлен `getLastExerciseSets(userId, exerciseId)`
- `hooks/use-history.ts` — добавлен `useLastExerciseSets` хук
- `active-workout.tsx` — Framer Motion свайпы (drag x), анимированный прогресс-бар, list-view с галочками, стрип "Предыдущий" из истории
- `workout-summary.tsx` — анимированный Trophy, breakdown по упражнениям с max weight

### Фаза 6 — Прогресс ✅
- `progress-screen.tsx` — мигрирован на `useExercises`, `useWorkoutHistory`, `useStreak`, `useMonthStats`, `useExerciseProgress`; без useState/useEffect для данных; Framer Motion анимации
- `activity-heatmap.tsx` — убран хардкод даты, используется `new Date()`
- `exercise-picker.tsx` — spring bottom-sheet анимация, badge группы мышц

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

_(Всё из Фаз 1-5 устранено)_

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
