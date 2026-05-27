# Deploy checklist (DevOps — T-010)

Выполнять только после human APPROVED на все фиче-тикеты MVP.

## Prerequisites (human provides)

- [ ] GitHub repo connected
- [ ] `DATABASE_URL` (Neon Postgres)
- [ ] `BOT_TOKEN` (BotFather)
- [ ] Vercel project

## Steps

1. Push `main` → Vercel production deploy
2. `prisma migrate deploy` in CI or Vercel build
3. BotFather: Mini App URL → `https://<vercel-domain>`
4. Smoke: open Mini App in Telegram, `/api/auth/me` returns user

## Env vars (Vercel)

| Name | Required |
|------|----------|
| `DATABASE_URL` | yes |
| `BOT_TOKEN` | yes |

## Rollback

Redeploy previous Vercel deployment; DB migrations are forward-only — plan rollback SQL if needed.
