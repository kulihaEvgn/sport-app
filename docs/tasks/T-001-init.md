# T-001: Init Next.js + TypeScript + Tailwind + shadcn


| Field           | Value                  |
| --------------- | ---------------------- |
| **Status**      | `approved`             |
| **Area**        | `fullstack`            |
| **Depends on**  | T-000 (human APPROVED) |
| **Max retries** | 2                      |


## Goal

Создать базовый Next.js 15 проект в корне репозитория с App Router, TypeScript, Tailwind, ESLint, shadcn/ui (минимальный layout).

## Acceptance criteria

- `npm run dev` запускается без ошибок
- `npm run lint` и `npm run typecheck` проходят
- App Router: `app/layout.tsx`, `app/page.tsx` — заглушка «Sport App»
- Tailwind настроен
- shadcn/ui инициализирован (Button)
- `.env.example` с плейсхолдерами `DATABASE_URL`, `BOT_TOKEN`
- `.gitignore` включает `.env`, `node_modules`, `.next`, `!.env.example`
- Сохранены `AGENTS.md`, `docs/`, `.cursor/rules/`

## Files likely touched

- `package.json`, `app/`**, `components/ui/`**, `tailwind.config.*`, `tsconfig.json`, `.env.example`

## Manual QA steps

1. `pnpm install && pnpm dev` — открыть localhost, видна заглушка
2. `pnpm lint` — exit 0
3. `pnpm exec tsc --noEmit` — exit 0
4. `AGENTS.md` и `docs/` на месте

## Completion (Developer)

- Summary: Next.js 15 + Tailwind v4 + shadcn Button, заглушка Sport App, `.env.example`
- Commands: `npm run lint`, `npm run typecheck`, `npm run build` — OK
- Ready for review: yes

