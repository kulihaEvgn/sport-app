# GymApp — Telegram Mini App

Персональное приложение для трекинга силовых тренировок в формате Telegram Mini App.
Циклические программы, лог реальных весов и повторений, прогресс по упражнениям, AI-генерация программ и описаний.

> Полная спецификация: [docs/SPEC.md](docs/SPEC.md)
> Состояние разработки: [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)
> Правила работы агента: [CLAUDE.md](CLAUDE.md)

---

## Стек

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** + shadcn/ui примитивы
- **Framer Motion** — анимации, свайпы, drag-to-reorder
- **Zustand + persist** — активная тренировка с восстановлением сессии
- **TanStack Query** — весь дата-слой (с фазы 1)
- **react-hook-form + zod** — формы и валидация
- **Prisma** + **Neon Postgres** — БД
- **Anthropic Claude** — генерация описаний / программ
- **Together AI** — генерация картинок
- **@telegram-apps/sdk-react** — Telegram Mini App SDK

---

## Локальный запуск

### 1. Подготовить окружение

```bash
cp .env.example .env
```

Заполни хотя бы `DATABASE_URL` (для локалки можно поднять Postgres в Docker), `BOT_TOKEN` для тестов в Telegram и ключи ИИ-провайдеров.

### 2. Поднять БД и накатить схему

```bash
npm install
npm run db:up        # Docker-compose: postgres на 5433
npm run db:push      # синхронизировать prisma schema → БД
npm run db:seed      # заполнить тестовыми данными (23 упражнения, программа на 12 дней, 17 тренировок истории)
```

### 3. Запустить dev-сервер

```bash
npm run dev
```

Приложение откроется на `http://localhost:3100`. Для теста в Telegram-окружении используется mock initData (см. `lib/telegram/setup-mock-env.ts`).

---

## Скрипты

| Скрипт | Что делает |
|--------|------------|
| `npm run dev` | Dev-сервер на :3100 (Turbopack) |
| `npm run build` | Прод-сборка |
| `npm run vercel-build` | Сборка для Vercel: `prisma generate && next build` |
| `npm start` | Прод-сервер на :3100 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Заглушка (тестов пока нет) |
| `npm run db:up` | `docker compose up -d` — поднять локальный Postgres |
| `npm run db:push` | `prisma db push` — синхронизировать схему |
| `npm run db:seed` | Накатить сидовые данные |
| `npm run db:studio` | Открыть Prisma Studio |
| `npm run api:smoke` | Smoke-тест API маршрутов |

### Gate (обязательная проверка перед коммитом)

```bash
npx tsc --noEmit && npm run lint && npm test
```

Подробнее — раздел 1 в [CLAUDE.md](CLAUDE.md).

---

## Переменные окружения

См. [.env.example](.env.example). Главные:

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Postgres connection string. Локально — Docker, прод — Neon (Pooled URL с `?sslmode=require`) |
| `BOT_TOKEN` | Токен Telegram-бота (BotFather). Используется для HMAC-валидации initData в проде |
| `ANTHROPIC_API_KEY` | Ключ Claude API для генерации текста |
| `TOGETHER_API_KEY` | Ключ Together AI для генерации картинок |
| `OPENAI_API_KEY` | Опциональный — переключаемый провайдер для текста |

> **Безопасность:** все ключи AI/БД/бота — только серверные. В клиентский бандл попадать не должны. `services/ai.ts` ходит во внутренние `/api/ai/*` маршруты.

---

## Структура

```
app/
  (main)/            # экраны с Header + BottomNav
    library/         # упражнения, программы
    workout/         # обзор программы и превью дня
    progress/        # тепловая карта + графики
  (session)/         # fullscreen без навбара
    library/         # CRUD, импорт
    workout/         # активная тренировка, summary
    profile/
  api/               # 17 routes: auth, exercises, programs, history, ai, import

components/
  ui/                # bottom-sheet, confirm-alert, loader, fab, screen-header,
                     # section-label, empty-state, muscle-chip, video-modal, ...
  nav/               # header, bottom-nav
  screens/           # фичевые компоненты по экранам (library, workout, progress, profile, import)
  tma/               # Telegram Mini App SDK обёртки

hooks/               # use-exercises, use-programs, use-history, use-progress,
                     # use-safe-area, use-back-swipe, use-user
lib/                 # prisma, auth, api-client, mappers, muscle-groups,
                     # progression, ai-provider, import-mapping, ...
services/            # exercises, programs, history, progress, ai
schemas/             # exercise, program, target-volume
store/               # workout-store (Zustand + persist), theme-store
types/               # все типы
prisma/              # schema.prisma, seed.ts
docs/                # SPEC.md, AGENT_HANDOFF.md
```

---

## Архитектурные правила

1. Компоненты ходят за данными **только через TanStack Query-хуки** (`hooks/*`). Прямые вызовы `services/*` в компонентах запрещены.
2. Все типы — в `types/index.ts`, zod-схемы — в `schemas/`.
3. `Program.cycleLength === templates.length` — инвариант, поддерживается в API.
4. `currentDayIndex` двигается **только в `finishWorkout`** через `/api/programs/:id/advance` по формуле `(i+1) % cycleLength`.
5. Источник истины по завершённым тренировкам — `services/history` (`/api/history`), а не Zustand.
6. **Safe Area Insets** через `useSafeAreaInsets()` — никаких хардкод-отступов сверху/снизу.
7. Mobile-first, max-width 430px. Темы через CSS-переменные `var(--color-app-*)` и Tailwind `dark:`.
8. Активная тренировка — Zustand с `persist`. Сессия восстанавливается при маунте.
9. Ключи AI/БД/бота — только серверные.

---

## Деплой

Приложение задеплоено на Vercel. Прод-build настроен в `package.json`:

```json
"vercel-build": "prisma generate && next build --turbopack"
```

### Vercel checklist
- Env переменные: `DATABASE_URL` (Neon pooled), `BOT_TOKEN`, `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, `OPENAI_API_KEY`
- В проде `lib/auth.ts` валидирует initData через HMAC (`@telegram-apps/init-data-node`). В dev (`NODE_ENV !== production`) — пропускается.
- Telegram bot: BotFather → `/newapp` → подвесить URL Mini App на Vercel-домен.

---

## Лицензия

Private project. Все права защищены.
