# Deploy checklist (DevOps — T-010)

Выполнять только после human APPROVED на все фиче-тикеты MVP.

## Prerequisites (human provides)

- [ ] GitHub repo connected
- [ ] `DATABASE_URL` (Neon Postgres)
- [ ] `BOT_TOKEN` (BotFather)
- [ ] Vercel project

## Steps

1. Push `main` → Vercel production deploy
2. Build сам запускает `prisma migrate deploy` (см. `package.json`)
3. BotFather: Mini App URL → `https://<vercel-domain>`
4. Один раз: `npm run db:seed` с production `DATABASE_URL` (если каталог пустой)
5. Smoke: Mini App → `/profile` User ID, `/exercises` список

Подробнее Neon + типичные ошибки: [VERCEL-NEON.md](./VERCEL-NEON.md)

## Env vars (Vercel)

| Name | Required | Note |
|------|----------|------|
| `DATABASE_URL` | yes | Neon **pooled** URL, `?sslmode=require` |
| `BOT_TOKEN` | yes | реальный токен бота |

## Rollback

Redeploy previous Vercel deployment; DB migrations are forward-only — plan rollback SQL if needed.
