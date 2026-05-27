# T-004: Auth (initData + /api/auth/me)

| **Status** | `human_review` |
| **Depends on** | T-003 |
| **Area** | `backend` |

## Goal

Валидация initData, upsert User, GET /api/auth/me.

## Acceptance criteria

- [x] `lib/auth.ts` — getUser, dev bypass с dev-placeholder
- [x] `GET /api/auth/me` — JSON пользователя
- [x] `lib/api-client.ts`
- [x] Profile показывает статус БД
- [x] lint, typecheck, build
