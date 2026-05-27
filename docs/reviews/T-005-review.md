# Review: T-005 Exercises API + UI

| Verdict | **PASS** |
|---------|----------|

## Quality gates

| Check | Result |
|-------|--------|
| `npx prisma generate` | OK (exit 0) |
| `npm run typecheck` | OK (exit 0) |
| `npm run lint` | OK (exit 0) |
| `npm run build` | OK (exit 0) |
| ReadLints (touched files) | OK (без ошибок) |

## Acceptance criteria

- [x] `GET/POST /api/exercises`, `GET/PATCH/DELETE /api/exercises/[id]`
- [x] Zod-валидация, `getUser`, глобальные + свои упражнения
- [x] Редактирование/удаление только своих (`userId`)
- [x] `/exercises` — фильтр по группе, форма создания/редактирования
- [x] lint, typecheck, build

## Manual QA

| Step | Result |
|------|--------|
| `curl` без Authorization → 401 | OK — `{"error":"Missing Authorization: tma <initData>"}` |
| GET с dev initData → seed-список | OK — 30 упражнений |
| `?muscleGroup=CHEST` → только CHEST | OK |
| Создать/изменить/удалить своё упражнение (API) | OK |
| UI: фильтр, форма, edit/delete | Не проверено вручную в браузере |

Итерация ревью: **2 / 2**
