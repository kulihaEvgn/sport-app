# Agent Handoff — GymApp (Telegram Mini App)

> Этот файл — точка входа для нового агента. Читай его ПОСЛЕ `docs/SPEC.md` и `CLAUDE.md`.
> Здесь зафиксировано что уже сделано, что нет, и где находятся важные куски кода.

---

## Текущее состояние: Фазы 1–5 завершены, Фаза 6 следующая

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
- `use-programs.ts` — `usePrograms`, `useProgram`, `useActiveProgram`, `useActiveProgramState`, `useTemplate`, `useSetActiveProgram`, `useCreateProgram`, `useUpdateProgram`, `useDeleteProgram`, `useAddTemplate`, `useUpdateTemplate`, `useRemoveTemplate`, `useAddExerciseToDay`, `useUpdateDayExercise`, `useRemoveExerciseFromDay`, `useReorderExercises`
- `use-history.ts` — `useWorkoutHistory`, `useWorkoutLog`, `useSaveWorkoutLog`, `useLastExerciseSets`
- `use-progress.ts` — `useExerciseProgress`, `useStreak`, `useMonthStats`, `useFavoriteMuscleGroup`
- `use-safe-area.ts` — `useSafeAreaInsets()` → `{ top, bottom }` из Telegram SDK

**Zustand store** (`store/workout-store.ts`):
- persist + localStorage, `partialize` (только нужные поля)
- `onRehydrateStorage` — оживляет Date объекты из JSON
- `startWorkout(template, userId)` — снапшотит шаблон в стор
- `finishWorkout(): Promise<void>` — сохраняет в history, двигает `currentDayIndex`, чистит стор
- `lastLogId: string | null` — мост: после `finishWorkout` session-страница читает его и делает `router.push('/workout/summary/${logId}')`
- `restoreSession(): void` — STUB (восстановление сессии работает автоматически через persist + useEffect в `/workout/page.tsx`)
- `viewMode: 'list' | 'cards'` — персистируется между сессиями

### Фаза 3 — Layout и навигация ✅

**Route groups**:
- `(main)` — с Header + BottomNav, safe area insets
- `(session)` — без навбара, full-screen (тренировка, формы, профиль)

**Навигация**:
- `components/nav/header.tsx` — логотип + аватарка (инициалы из Telegram), тап → `/profile`
- `components/nav/bottom-nav.tsx` — 3 таба: `/library` | `/workout` | `/progress`, zIndex: 100

**Роуты (session)**:
- `/library/exercises/new` — новое упражнение
- `/library/exercises/[id]` — детальная карточка (onBack использует `router.back()`)
- `/library/exercises/[id]/edit` — редактирование
- `/library/programs/new` — новая программа
- `/library/programs/[id]/edit` — редактирование программы
- `/library/programs/[id]/days/[dayId]` — редактор дня
- `/library/import` — заглушка
- `/workout/[templateId]/session` — активная тренировка
- `/workout/summary/[logId]` — саммари
- `/profile` — профиль пользователя

### Фаза 4 — Библиотека ✅

**Упражнения**:
- Список с поиском и фильтром по группе мышц
- CRUD через хуки + `ExerciseForm` (react-hook-form + zod)
- Детальная карточка: мышца, описание, оборудование, YouTube видео (кнопка закреплена внизу)
- `videoUrl` в mock добавлен у 9 упражнений; regex поддерживает все форматы YouTube (watch, shorts, embed, youtu.be)

**Программы**:
- Список с кнопкой активации
- CRUD: `ProgramForm`, `ProgramDetail`
- День программы: `ExercisePicker` + `ConfigSheet`, drag-to-reorder (Framer Motion Reorder)
- В редакторе дня: клик на упражнение → `ExerciseInfoSheet`, карандаш → `ConfigSheet`

### Фаза 5 — Тренировка ✅

**`/workout` page** (`app/(main)/workout/page.tsx`):
- Использует `useActiveProgram()` + `useActiveProgramState()` (хуки, не прямые вызовы)
- `currentDayIndex` берётся из `programState?.currentDayIndex`
- При наличии `activeWorkout && template` — редиректит на сессию (restore session через persist)

**Day preview** (`components/screens/workout/day-preview.tsx`):
- Показывает упражнения, подходы × повторения, плановый вес
- Клик на упражнение → `ExerciseInfoSheet`

**Активная тренировка** (`components/screens/workout/active-workout.tsx`):

*List view* (`viewMode === 'list'`):
- Все упражнения видны, каждый ряд кликабелен → `ExerciseInfoSheet`
- Кнопка "Выполнено" + поле веса, предыдущий результат (`PrevResult` через `useLastExerciseSets`)
- Деселект выполненного: кнопка "Отменить" (RotateCcw) + клик по чекмарку
- Кнопка "Завершить тренировку" появляется когда всё выполнено

*Tinder view* (`viewMode === 'cards'`):
- Swipe right = выполнено, swipe left = пропустить (бесконечный цикл)
- Карточка центрирована по вертикали (`justify-center`)
- Directional exit animation через `custom` prop pattern (Framer Motion)
- `touchAction: 'none'` на карточке — обязательно для drag на mobile
- Action hint кнопки внизу ("← Пропустить" / "✓ Выполнено")
- Кнопка "Видео" на карточке если есть YouTube ссылка (данные через `useExercise` — живые)
- Progress dots вверху

*Оба вида*:
- Таймер тренировки (elapsed), переключатель вида (list ↔ cards) в хедере
- Прогресс-бар выполненных упражнений
- `ConfirmAlert` при отмене тренировки

**Workout Summary** (`components/screens/workout/workout-summary.tsx`):
- Показывает время, кол-во подходов, объём (кг), список упражнений

---

## Shared UI компоненты (`components/ui/`)

Все модалки/шиты используют `zIndex: 110` (выше bottom nav с `zIndex: 100`).

| Компонент | Описание |
|-----------|---------|
| `confirm-alert.tsx` | Центрированный алерт с двумя кнопками (отмена/подтверждение), scale+fade анимация |
| `video-modal.tsx` | YouTube iframe, `isShorts` → 9:16 aspect ratio |
| `bottom-sheet.tsx` | Slide-up снизу, drag-to-dismiss (offset > 80px или velocity > 500), `maxHeight` prop |
| `exercise-info-sheet.tsx` | Инфо об упражнении: мышца, план, описание, видео-кнопка, иконка-ссылка на полную карточку. Данные через `useExercise` (живые, не из снапшота Zustand). Используется в 3 местах: list view тренировки, редактор дня, day preview |

---

## Что НЕ сделано (Фазы 6–10)

### Фаза 6 — Прогресс ⏳ СЛЕДУЮЩАЯ
- Тепловая карта активности (заглушка `activity-heatmap.tsx` есть)
- Графики прогресса по упражнению (заглушка `progress-chart.tsx` есть)
- Personal Records (PR) по каждому упражнению
- Всё читает из `services/history` через `use-history` / `use-progress` хуки

### Фаза 7 — Профиль
- Данные Telegram (имя, аватарка) — уже частично есть в `profile-screen.tsx`
- Переключатель темы (dark/light)
- Статистика: кол-во тренировок, недели активности, любимая группа мышц

### Фаза 8 — ИИ фичи
- Генерация описания упражнения — заглушка `handleGenerate` уже есть в `exercise-form.tsx`, нужно заменить на `/api/ai/description`
- Генерация картинки — `/api/ai/image`
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

1. Компоненты → только через TanStack Query хуки (`hooks/*`). Прямых вызовов `services/*` в компонентах быть не должно.
2. `cycleLength === templates.length` — поддерживается в `updateProgramTemplates()` в `services/programs.ts`.
3. `currentDayIndex` двигается ТОЛЬКО в `finishWorkout`, формула `(i+1) % cycleLength`.
4. Источник истины по завершённым тренировкам — `services/history`, не Zustand.
5. Safe Area Insets — `useSafeAreaInsets()`, отступы не хардкодить.
6. Gate перед каждым коммитом: `npx tsc --noEmit && npm run lint && npm test`.
7. Все модальные оверлеи: `zIndex: 110` (выше bottom nav `zIndex: 100`).
8. Framer Motion drag: обязателен `touchAction: 'none'`, нельзя `overflow-y-auto` внутри draggable.
9. Directional exit в AnimatePresence — только через `custom` prop pattern (не через state в `exit`).
10. `useExercise(id)` в инфо-компонентах — получает живые данные поверх снапшота в Zustand.

---

## Известные технические долги

| Файл | Проблема |
|------|---------|
| `store/workout-store.ts` | `restoreSession()` — stub, восстановление работает через persist + useEffect |
| `app/(main)/workout/[templateId]/page.tsx` | Использует `MOCK_USER` напрямую — нужно заменить на Telegram userId в Фазе 9 |

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
  ui/              — bottom-sheet, confirm-alert, video-modal, exercise-info-sheet
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
data/              — mock.ts (mock данные, videoUrl у 9 упражнений)
```
