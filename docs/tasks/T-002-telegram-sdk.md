# T-002: Telegram Mini App SDK

| Field | Value |
|-------|-------|
| **Status** | `done` |
| **Area** | `frontend` |
| **Depends on** | T-001 (human APPROVED) |
| **Max retries** | 2 |

## Goal

Подключить `@telegram-apps/sdk-react`: провайдер, mock для dev, BackButton, тема Telegram.

## Acceptance criteria

- [x] Установлены `@telegram-apps/sdk-react`, `@telegram-apps/sdk`
- [x] `components/tma/telegram-provider.tsx` — init SDK, mock вне Telegram
- [x] Provider в `app/layout.tsx` через `Providers`
- [x] `/profile` — имя пользователя из `initDataUser`
- [x] `useTelegramBackButton` на `/profile`
- [x] lint, typecheck, build OK

## Manual QA steps

1. `npm run dev` в браузере — mock user, `/profile` показывает имя
2. Нет ошибок SDK init в console
