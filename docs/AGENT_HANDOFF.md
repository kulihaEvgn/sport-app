# Agent Handoff — GymApp (Telegram Mini App)

> Этот файл — точка входа для нового агента. Читай его ПОСЛЕ `docs/SPEC.md` и `CLAUDE.md`.
> Здесь зафиксировано что уже сделано, что нет, и где находятся важные куски кода.

---

## Текущее состояние: Фазы 1–10 завершены, проект задеплоен на Vercel

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
- `Program.cycleLength === templates.length` — инвариант, поддерживается в API routes
- `UserProgramState { userId, programId, currentDayIndex }` — отдельно от `User`
- `SetLog.templateExerciseId` — есть (отличает повтор одного упражнения в сессии)
- `WorkoutLog.programId` и `WorkoutLog.dayIndex` — есть

**Схемы** (`schemas/`):
- `schemas/exercise.ts` — `exerciseSchema`, `ExerciseInput`
- `schemas/program.ts` — `programSchema`, `ProgramInput`
- `schemas/target-volume.ts` — `targetVolumeSchema`

**Сервисы** (`services/`): все async, возвращают `Promise<T>`, ходят через `apiFetch`:
- `services/exercises.ts` — CRUD
- `services/programs.ts` — CRUD программ, шаблонов, упражнений дня; `advanceProgramDay`
- `services/history.ts` — `saveWorkoutLog`, `getWorkoutHistory`, `getWorkoutLog`
- `services/progress.ts` — `getExerciseProgress`, `getStreak`, `getMonthStats`, `getFavoriteMuscleGroup` (клиентская агрегация поверх history)

**Хуки** (`hooks/`):
- `use-exercises.ts` — `useExercises`, `useExercise`, `useCreateExercise`, `useUpdateExercise`, `useDeleteExercise`
- `use-programs.ts` — `usePrograms`, `useProgram`, `useActiveProgram`, `useActiveProgramState`, `useTemplate`, `useSetActiveProgram`, `useCreateProgram`, `useCreateFullProgram`, `useUpdateProgram`, `useDeleteProgram`, `useAddTemplate`, `useUpdateTemplate`, `useRemoveTemplate`, `useAddExerciseToDay`, `useUpdateDayExercise`, `useRemoveExerciseFromDay`, `useReorderExercises`
- `use-history.ts` — `useWorkoutHistory`, `useWorkoutLog`, `useSaveWorkoutLog`, `useLastExerciseSets`, `useLastNExerciseSessions`
- `use-progress.ts` — `useExerciseProgress`, `useStreak`, `useMonthStats`, `useFavoriteMuscleGroup`
- `use-safe-area.ts` — `useSafeAreaInsets()` → `{ top, bottom }` из Telegram SDK
- `use-user.ts` — `useUser()` → `User` из `/api/auth/me`

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
- `/library/exercises/[id]` — детальная карточка
- `/library/exercises/[id]/edit` — редактирование
- `/library/programs/new` — новая программа
- `/library/programs/[id]/edit` — редактирование программы
- `/library/programs/[id]/days/[dayId]` — редактор дня
- `/workout/[templateId]/session` — активная тренировка
- `/workout/summary/[logId]` — саммари
- `/profile` — профиль пользователя

### Фаза 4 — Библиотека ✅

**Упражнения**:
- Список с поиском и фильтром по группе мышц (через `useExercises()`, не прямой вызов сервиса)
- CRUD через хуки + `ExerciseForm` (react-hook-form + zod)
- Детальная карточка: мышца, описание, оборудование, YouTube видео
- FAB "+" → `AddLibrarySheet`

**Программы**:
- Список с кнопкой активации, удаление (кроме активной)
- CRUD: `ProgramForm`, `ProgramDetail`
- День программы: `ExercisePicker` + `ConfigSheet`, drag-to-reorder (Framer Motion Reorder)
- FAB "+" → `AddLibrarySheet`

### Фаза 5 — Тренировка ✅

**`/workout` page** (`app/(main)/workout/page.tsx`):
- Использует `useActiveProgram()` + `useActiveProgramState()` (хуки)
- `currentDayIndex` берётся из `programState?.currentDayIndex`
- При наличии `activeWorkout && template` — редиректит на сессию

**Активная тренировка** (`components/screens/workout/active-workout.tsx`):
- List view и Tinder view (свайпы), переключение
- Таймер, прогресс-бар, `ConfirmAlert` при отмене
- `finishWorkout` → сохраняет в `/api/history`, двигает день программы через `/api/programs/:id/advance`

### Фаза 6 — Прогресс ✅
- Тепловая карта, streak, месячная статистика
- График роста веса SVG, выбор упражнения, переключатель периода через URL params
- PR карточка

### Фаза 7 — Профиль + Тема ✅
- Имя/фото из Telegram SDK, fallback на `useUser()`
- Активная программа, статистика, переключатель темы
- Runtime CSS tokens: `:root` / `.dark`, все компоненты через `var(--color-app-*)`

### Фаза 8 — ИИ фичи ✅

**API routes** (`app/api/ai/`):
- `generate-exercise` — описание упражнения
- `generate-image` — картинка через Together AI
- `generate-program` — полная программа по параметрам
- Ключи только серверные (`ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`)

**Подсказка прогрессии** (`lib/progression.ts`):
- `shouldSuggestProgression(sessions, targetVolume)` — ≥3 сессии, вес стабильный, повторения ≥ max

### Фаза 9 — Бэкенд ✅

**Prisma** (`prisma/schema.prisma`):
- Модели: `User`, `Exercise`, `Program`, `WorkoutTemplate`, `WorkoutTemplateExercise` (TargetVolume как Json), `WorkoutLog`, `SetLog`, `UserProgramState`
- `prisma/seed.ts` — идемпотентный сид: 1 dev-юзер (id='1'), 23 упражнения, программа 12 дней, 17 тренировок истории
- `lib/prisma.ts` — singleton PrismaClient

**Auth** (`lib/auth.ts`):
- `getUserIdFromRequest(req)` — парсит `X-Telegram-Init-Data` header
- В dev (`NODE_ENV !== production`) — пропускает HMAC, берёт userId из `user` поля initData
- В prod — валидирует через `@telegram-apps/init-data-node` + `BOT_TOKEN`
- Автоматически upsert User в БД при каждом запросе

**API client** (`lib/api-client.ts`):
- `apiFetch<T>(path, options)` — автоматически добавляет `X-Telegram-Init-Data` header
- ISO-8601 date reviver — все строки-даты из JSON автоматически становятся `Date` объектами
- Пустой ответ (204 No Content) возвращает `undefined`

**Mappers** (`lib/mappers.ts`):
- Prisma → TypeScript types: `mapExercise`, `mapProgram`, `mapTemplate`, `mapTemplateExercise`, `mapWorkoutLog`, `mapSetLog`, `mapUser`, `mapUserProgramState`
- `programInclude`, `templateInclude` — Prisma include-селекторы (DRY)

**API routes** (16 маршрутов):
```
app/api/
  auth/me/                                              GET
  exercises/                                            GET, POST
  exercises/[id]/                                       GET, PUT, DELETE
  programs/                                             GET, POST
  programs/full/                                        POST (createFullProgram)
  programs/[id]/                                        GET, PUT, DELETE
  programs/[id]/set-active/                             POST
  programs/[id]/state/                                  GET
  programs/[id]/advance/                                POST
  programs/[id]/templates/                              POST
  programs/[id]/templates/[templateId]/                 PUT, DELETE
  programs/[id]/templates/[templateId]/exercises/       POST
  programs/[id]/templates/[templateId]/exercises/reorder/ POST
  programs/[id]/templates/[templateId]/exercises/[teId]/ PUT, DELETE
  history/                                              GET, POST
  history/[id]/                                         GET
```

**Сервисы** — тела заменены на `apiFetch('/api/...')`, сигнатуры не изменились.

**Загрузочные состояния** (`components/ui/loader.tsx`):
- `Spinner` — инлайн для кнопок
- `PageLoader` — центрированный спиннер для страниц
- `SkeletonBlock` / `SkeletonList` — пульсирующие заглушки для списков

---

### Фаза 10 — Деплой ✅
- Приложение задеплоено на Vercel
- `package.json` → `vercel-build` запускает `prisma generate && next build --turbopack`
- Прод-env на Vercel: `DATABASE_URL` (Neon pooled), `BOT_TOKEN`, `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, `OPENAI_API_KEY`
- В проде `lib/auth.ts` валидирует initData через HMAC (`@telegram-apps/init-data-node`); в dev HMAC пропускается

### Post-Phase polish ✅
- **Safe Area везде:** `BottomSheet`, `ExerciseForm`, `ProgramForm`, `ExercisePicker` теперь читают `useSafeAreaInsets`. FAB вынесен в `components/ui/fab.tsx` и учитывает bottom inset.
- **Лоадеры на всех мутациях:** `useDeleteExercise`/`useSetActiveProgram`/`useDeleteProgram` теперь подключены прямо в `ExerciseDetail`/`ProgramDetail` (isPending → Spinner/disabled). `ActiveWorkout.handleFinish` блокирует кнопки на время сохранения. Детальные страницы рендерят `PageLoader` пока идёт `isLoading`.
- **Import Hub:** реализован `components/screens/import/import-hub.tsx`. Источники: CSV (papaparse), Excel (xlsx/SheetJS), Obsidian (.md table parser в `lib/import-mapping.ts`), Notion (через `/api/import/notion`). Импорт упражнений реален; импорт программ — заглушка с пометкой "в разработке". `AddLibrarySheet` навигирует в `/library/import?context=...&source=...`.
- **Общие UI-компоненты:** `FAB`, `ScreenHeader`, `SectionLabel`, `EmptyState`, `MuscleChip` в `components/ui/`. Применены в `day-preview`, `program-detail`, `profile-screen`, `import-hub`, library pages.

---

## Что НЕ сделано

Все фазы из SPEC.md завершены. Из бэклога остались только сравнительно маленькие задачи:
- Импорт программ (сейчас экран показывает "в разработке")
- Серверная агрегация прогресса (см. долги ниже)
- Восстановление прерванной сессии — есть автоматически через persist, отдельный `restoreSession()` всё ещё stub

---

## Архитектурные правила

1. Компоненты → только через TanStack Query хуки (`hooks/*`). Прямых вызовов `services/*` в компонентах быть не должно.
2. `cycleLength === templates.length` — поддерживается в API routes (`programs/[id]/templates/` POST/DELETE).
3. `currentDayIndex` двигается ТОЛЬКО в `finishWorkout`, через `/api/programs/:id/advance`, формула `(i+1) % cycleLength`.
4. Источник истины по завершённым тренировкам — `services/history` (→ `/api/history`), не Zustand.
5. Safe Area Insets — `useSafeAreaInsets()`, отступы не хардкодить.
6. Gate перед каждым коммитом: `npx tsc --noEmit && npm run lint && npm test`.
7. Все модальные оверлеи: `zIndex: 110` (выше bottom nav `zIndex: 100`).
8. Framer Motion drag: обязателен `touchAction: 'none'`, нельзя `overflow-y-auto` внутри draggable.
9. Directional exit в AnimatePresence — только через `custom` prop pattern.
10. `useExercise(id)` в инфо-компонентах — получает живые данные поверх снапшота в Zustand.
11. AnimatePresence в `(main)/layout.tsx` — ключ `tabKey` (первый сегмент пути).
12. Back swipe отключён на `/session` путях. Tab swipe убран.
13. Safe area в session layout: padding на `motion.div`, не на родителе.
14. Даты из API — автоматически `Date` объекты (reviver в `apiFetch`). Не кастить вручную.
15. `program.templates` может быть пустым если программа без дней — защищаться через `nextTemplate && ...`.

---

## Известные технические долги

| Файл | Проблема |
|------|---------|
| `store/workout-store.ts` | `restoreSession()` — stub, восстановление работает через persist + useEffect |
| `services/progress.ts` | Агрегация делается клиентски (загружает всю историю). В будущем — серверная агрегация через отдельные API routes |

---

## Структура ключевых директорий

```
app/
  (main)/          — layout с Header + BottomNav
    library/       — /exercises, /programs (FAB → AddLibrarySheet)
    workout/       — /[templateId] (превью дня)
    progress/
  (session)/       — layout без навбара
    library/programs/[id]/days/[dayId]  — редактор дня
    workout/[templateId]/session        — активная тренировка
    workout/summary/[logId]             — саммари
    profile/
  api/             — 16 API routes (auth, exercises, programs, history)

components/
  ui/              — bottom-sheet, confirm-alert, video-modal, exercise-info-sheet, loader
  nav/             — header.tsx, bottom-nav.tsx
  screens/
    library/       — exercise-card, exercise-detail, exercise-form, exercise-picker,
                     program-detail, program-form, add-library-sheet, ai-program-sheet
    workout/       — active-workout, day-preview, no-program-view, program-overview, workout-summary
    progress/      — activity-heatmap, exercise-picker, progress-chart, progress-screen
    profile/       — profile-screen

hooks/             — use-exercises, use-programs, use-history, use-progress,
                     use-safe-area, use-back-swipe, use-user
lib/               — muscle-groups.ts, nav-direction.ts, ai-provider.ts, progression.ts,
                     prisma.ts, auth.ts, api-client.ts, mappers.ts
services/          — exercises, programs, history, progress, ai (все async, fetch к API)
schemas/           — exercise, program, target-volume
store/             — workout-store.ts (Zustand + persist), theme-store.ts
types/             — index.ts (все типы)
data/              — mock.ts (mock данные — больше не используется в рантайме, только в seed)
prisma/            — schema.prisma, seed.ts
docs/              — SPEC.md, AGENT_HANDOFF.md
```
