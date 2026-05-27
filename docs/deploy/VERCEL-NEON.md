# Vercel + Neon — быстрый фикс БД

## 1. Переменные в Vercel (Project → Settings → Environment Variables)

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | **Pooled** connection string из Neon (в дашборде: *Connection string* → *Pooled*) |
| `BOT_TOKEN` | Токен бота из BotFather (не `dev-placeholder`) |

Пример pooled URL:
```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

После изменения env — **Redeploy** (Deployments → … → Redeploy).

## 2. Схема при деплое

В `package.json` build запускает `prisma migrate deploy` — таблицы создаются на каждом деплое.

## 3. Seed (один раз)

После первого успешного деплоя, локально:

```bash
# подставь production DATABASE_URL из Vercel
export DATABASE_URL="postgresql://..."
npm run db:seed
```

Или в Neon SQL Editor — не обязательно, если seed уже был при локальном `db:push` на ту же БД.

## 4. Если таблицы уже были через `db:push`

Миграция может ругаться «table already exists». Пометь миграцию применённой:

```bash
export DATABASE_URL="..."
npx prisma migrate resolve --applied 20250527000000_init
```

Потом Redeploy.

## 5. Проверка

1. Telegram → Mini App → `/profile` — есть User ID
2. `/exercises` — список упражнений
3. Vercel → Deployment → Build Logs — строка `prisma migrate deploy` без ошибок
