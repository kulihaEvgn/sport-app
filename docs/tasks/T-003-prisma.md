# T-003: Prisma + PostgreSQL schema

| **Status** | `human_review` |
| **Depends on** | T-002 human APPROVED |
| **Area** | `backend` |

## Goal

Prisma schema (User, Exercise, Program, ProgramExercise), `lib/prisma.ts`, migrate, seed упражнений.

## Acceptance criteria

- [x] `prisma/schema.prisma` по plan
- [x] `lib/prisma.ts` singleton
- [x] `prisma/seed.ts` — 30 упражнений
- [x] `.env.example`, `docker-compose.yml`, `docs/DATABASE.md`
- [x] Prisma 6, `prisma validate` + `prisma generate` OK
