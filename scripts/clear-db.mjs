// Полная очистка БД. Удаляет данные во всех таблицах с учётом FK-зависимостей.
// Запуск: node scripts/clear-db.mjs
// DATABASE_URL берётся из .env (Next/Prisma подхватывают автоматически через dotenv).

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

async function main() {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown host)'
  console.log(`Connecting to: ${host}`)

  const before = {
    setLogs:      await prisma.setLog.count(),
    workoutLogs:  await prisma.workoutLog.count(),
    templateExs:  await prisma.workoutTemplateExercise.count(),
    templates:    await prisma.workoutTemplate.count(),
    states:       await prisma.userProgramState.count(),
    programs:     await prisma.program.count(),
    exercises:    await prisma.exercise.count(),
    users:        await prisma.user.count(),
  }
  console.log('Before:', before)

  await prisma.setLog.deleteMany()
  await prisma.workoutLog.deleteMany()
  await prisma.workoutTemplateExercise.deleteMany()
  await prisma.workoutTemplate.deleteMany()
  await prisma.userProgramState.deleteMany()
  await prisma.program.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.user.deleteMany()

  const after = {
    setLogs:      await prisma.setLog.count(),
    workoutLogs:  await prisma.workoutLog.count(),
    templateExs:  await prisma.workoutTemplateExercise.count(),
    templates:    await prisma.workoutTemplate.count(),
    states:       await prisma.userProgramState.count(),
    programs:     await prisma.program.count(),
    exercises:    await prisma.exercise.count(),
    users:        await prisma.user.count(),
  }
  console.log('After:',  after)
  console.log('Done.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
