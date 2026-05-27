# T-000: Bootstrap AI agents workflow

| Field | Value |
|-------|-------|
| **Status** | `done` |
| **Area** | `infra` |
| **Depends on** | — |
| **Max retries** | 2 |

## Goal

Создать скелет команды агентов: AGENTS.md, шаблон тикета, Cursor rules, структуру docs, human-review gate.

## Acceptance criteria

- [x] `AGENTS.md` с ролями и воркфлоу (+ human gate после ревьюера)
- [x] `docs/tasks/TEMPLATE.md`
- [x] `docs/reviews/`, `docs/human-review/`, `docs/deploy/`
- [x] `docs/cursor-rules/*.mdc` (копия для `.cursor/rules/`)
- [x] `docs/deploy/DEPLOY.md` — черновик чеклиста
- [x] `docs/reviews/T-000-review.md` со статусом PASS

## Files touched

- `AGENTS.md`
- `docs/**`
- `.cursor/rules/*.mdc`

## Manual QA steps

1. Открыть `AGENTS.md` — описаны 4 роли и human gate
2. Открыть каждый `.mdc` rule — frontmatter и инструкции на месте
3. `docs/tasks/TEMPLATE.md` содержит AC, QA, status

## Completion (Developer)

- Summary: Phase 0 bootstrap complete
- Ready for review: yes
