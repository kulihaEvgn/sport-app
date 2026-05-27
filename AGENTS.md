# Sport App — AI Agent Workflow

Telegram Mini App (Next.js + Prisma + PostgreSQL). Разработка ведётся через роли-агенты в отдельных чатах Cursor.

## Роли

| Роль | Промпт для старта чата | Rule file |
|------|------------------------|-----------|
| **Оркестратор** | «Ты Оркестратор. Прочитай plan и выдай следующий тикет.» | `docs/cursor-rules/orchestrator.md` |
| **Разработчик** | «Ты Разработчик. Выполни `docs/tasks/T-XXX.md`.» | `docs/cursor-rules/developer.md` |
| **Ревьюер** | «Ты Ревьюер. Проверь тикет T-XXX, не правь код.» | `docs/cursor-rules/reviewer.md` |
| **DevOps** | «Ты DevOps. Выполни deploy по `docs/deploy/DEPLOY.md`.» | `docs/cursor-rules/devops.md` |

**Один раз:** создай `.cursor/rules/*.mdc` по шаблонам из `docs/cursor-rules/*.md` (frontmatter внутри файлов).

## Воркфлоу (обязательный)

```
Оркестратор → тикет (docs/tasks/T-XXX.md)
  → Разработчик → in_review
  → Ревьюер → PASS | CHANGES_REQUESTED (макс. 2 итерации)
  → При PASS → Human review (владелец проекта)
  → Human APPROVED → следующий тикет
  → Human CHANGES_REQUESTED → снова Разработчик
```

**Human gate:** после каждого `PASS` ревьюера создаётся `docs/human-review/T-XXX.md`. Следующий тикет **не стартует**, пока владелец не поставит статус `APPROVED`.

## Артефакты

```
docs/
  tasks/           # тикеты (оркестратор)
  reviews/         # отчёты ревьюера
  human-review/    # ожидание / APPROVED владельца
  deploy/          # чеклисты DevOps
```

## Источники правды

- Продукт и архитектура: [docs/PLAN.md](docs/PLAN.md) (копия плана в репозитории)
- Тикет: `docs/tasks/T-XXX.md` — единственный scope для разработчика
- Acceptance criteria и Manual QA — только из тикета

## Человек (владелец)

- Секреты: `BOT_TOKEN`, `DATABASE_URL`, Vercel, Neon, BotFather
- Human review после каждого одобренного ревьюером тикета
- Разбор `blocked` после 2 неудачных ревью

## Стек (кратко)

Next.js 15 App Router, Prisma, PostgreSQL (Neon), `@telegram-apps/sdk-react`, shadcn/ui, React Query.
