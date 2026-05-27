# База данных

## Вариант A: Docker (локально)

```bash
docker compose up -d
npm run db:push
npm run db:seed
```

`DATABASE_URL` в `.env`:

```
postgresql://sport:sport@localhost:5433/sport_app
```

## Вариант B: Neon (облако)

1. Создай проект на https://neon.tech
2. Скопируй connection string в `.env` как `DATABASE_URL`
3. `npm run db:push && npm run db:seed`

## Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run db:push` | Синхронизировать schema → БД |
| `npm run db:seed` | 30 базовых упражнений |
| `npm run db:studio` | Prisma Studio (GUI) |
