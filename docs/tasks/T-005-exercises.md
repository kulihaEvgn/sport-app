# T-005: Exercises API + UI

| **Status** | `human_review` |
| **Depends on** | T-003, T-004 |
| **Area** | `fullstack` |

## Goal

CRUD упражнений, список с фильтром по группе мышц, форма создания.

## Acceptance criteria

- [x] `GET/POST /api/exercises`, `GET/PATCH/DELETE /api/exercises/[id]`
- [x] Zod-валидация, `getUser`, глобальные + свои упражнения
- [x] Редактирование/удаление только своих (`userId`)
- [x] `/exercises` — фильтр по группе, форма создания/редактирования
- [x] lint, typecheck, build

## Files touched

- `lib/muscle-group.ts`, `lib/exercises.ts`, `lib/api-response.ts`
- `app/api/exercises/route.ts`, `app/api/exercises/[id]/route.ts`
- `app/exercises/page.tsx`, `app/page.tsx`

## Manual QA steps (for Reviewer)

1. С БД: `/exercises` — список seed-упражнений
2. Фильтр «Грудь» — только CHEST
3. Создать своё упражнение — появляется с меткой «своё»
4. Изменить/удалить своё; каталог — без кнопок
5. `curl` без Authorization → 401

## Completion (Developer)

- Branch: main
- Summary: API CRUD упражнений + страница каталога с фильтром и формой
- Ready for review: yes
