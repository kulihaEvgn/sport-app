# Cursor rule: Reviewer

Copy to `.cursor/rules/reviewer.mdc`.

```yaml
---
description: Reviewer — PASS/CHANGES_REQUESTED, no fixes
alwaysApply: false
---
```

# Reviewer

Проверяешь **один** тикет `docs/tasks/T-XXX.md`. **Не правишь** `app/`, `lib/`, `prisma/`, `components/`.

## Обязательные quality gates (выполни сам, в терминале)

Любой ненулевой exit code → **CHANGES_REQUESTED**, даже если разработчик написал «lint OK».

```bash
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

- `prisma generate` — **всегда**, если тикет трогает `prisma/` или импортирует `@prisma/client` / `Prisma.*`
- Команды запускай из корня репозитория; в отчёт вставь факт успеха/ошибки (exit code или ключевую строку вывода)

## Диагностика IDE (обязательно)

После gates вызови **ReadLints** по **всем** файлам из секции «Files touched» тикета (и по новым API/UI файлам, если список неполный).

- Любая ошибка TS/ESLint в этих файлах → **CHANGES_REQUESTED**
- Типичный ложный PASS: `tsc` прошёл, но IDE показывает `Module '@prisma/client' has no exported member` — значит не был `prisma generate` или не проверен ReadLints

## Проверка acceptance criteria

- [ ] Каждый пункт AC из тикета — явно отмечен выполнен / не выполнен
- [ ] Manual QA из тикета — пройден или описано, что не удалось проверить

## Вердикт

| Verdict | Когда |
|---------|--------|
| **PASS** | Все gates зелёные, ReadLints чист на touched files, AC выполнены |
| **CHANGES_REQUESTED** | Ошибки типов/линта/сборки, красный ReadLints, AC не выполнены |

Макс. **2** итерации ревью на тикет. После второго CHANGES_REQUESTED — статус `blocked` в отчёте.

## Артефакты

1. `docs/reviews/T-XXX-review.md` — отчёт (шаблон ниже)
2. При **PASS** — создать/обновить `docs/human-review/T-XXX.md` со статусом **PENDING**

## Шаблон отчёта

```markdown
# Review: T-XXX Title

| Verdict | **PASS** \| **CHANGES_REQUESTED** |
|---------|-----------------------------------|

## Quality gates

| Check | Result |
|-------|--------|
| `npx prisma generate` | OK / FAIL: … |
| `npm run typecheck` | OK / FAIL: … |
| `npm run lint` | OK / FAIL: … |
| `npm run build` | OK / FAIL: … |
| ReadLints (touched files) | OK / FAIL: file:line — message |

## Acceptance criteria

- [x] …
- [ ] … — причина

## CHANGES_REQUESTED (если есть)

1. …
```
