// Импортирует 9 дней Fullbody-программы из markdown-экспорта Notion.
// Дефолтно — только PREVIEW (печать что распарсилось, без записи в БД).
// С флагом --apply пишет всё в БД.
//
// Запуск:
//   node scripts/import-fullbody-days.mjs          # preview
//   node scripts/import-fullbody-days.mjs --apply  # запись

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

config()
const prisma = new PrismaClient()

const PROGRAM_ID = 'cmq3il0uc0001rhb5p8wi6jp7'
const APPLY = process.argv.includes('--apply')

// Manual aliases from Notion source name → canonical exercise name in DB.
const OVERRIDES = {
  'Разгибание ног сидя':                              'Разгибания ног в тренажере',
  'Штанга на скамье по одной руке на широчайшую':     'Тяга гантелей в наклоне по 1-й руке',
  'Т-гриф':                                           'Тяга Т-грифа',
}

const SRC_DIR     = '/tmp/fullbody/Private & Shared/Trannings fullbody'
const NESTED_ZIP  = '/tmp/fullbody/ExportBlock-73bdf9a0-397a-4c2f-949f-437a501c4ed4-Part-1.zip'
const DAY9_GLOB   = 'Private & Shared/Trannings fullbody/Day 9*'

const YT_ID_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/

function extractYouTubeId(url) {
  return url?.match(YT_ID_RE)?.[1] ?? null
}

// Parses "4х7-8" or "3х8-10" or "5х15" or "2х10-12д" into { sets, min, max }
function parseSetsReps(text) {
  if (!text) return null
  const m = text.match(/(\d+)\s*[хxХX]\s*(\d+)(?:\s*[-–]\s*(\d+))?/)
  if (!m) return null
  const sets = parseInt(m[1], 10)
  const min  = parseInt(m[2], 10)
  const max  = m[3] ? parseInt(m[3], 10) : undefined
  return { sets, min, max }
}

// Parses "3 мин" / "30 сек" / "10" → seconds
function parseRest(text) {
  if (!text) return 90
  const trimmed = text.trim()
  const minMatch = trimmed.match(/(\d+)\s*мин/i)
  if (minMatch) return parseInt(minMatch[1], 10) * 60
  const secMatch = trimmed.match(/(\d+)\s*сек/i)
  if (secMatch) return parseInt(secMatch[1], 10)
  const bare = trimmed.match(/^(\d+)$/)
  if (bare) {
    const n = parseInt(bare[1], 10)
    return n <= 10 ? n * 60 : n // 1-10 treat as minutes
  }
  return 90
}

// Parses weight cell: returns number or undefined.
// Handles "-35", "40", "80д", "10 общий", "Скипп", "32 (общий)", "10 О"
function parseWeight(text) {
  if (!text) return undefined
  const t = text.trim()
  if (/скип/i.test(t)) return undefined
  const m = t.match(/-?\d+(?:[.,]\d+)?/)
  if (!m) return undefined
  return parseFloat(m[0].replace(',', '.'))
}

function readDay9() {
  try {
    return execSync(`LANG=en_US.UTF-8 unzip -p "${NESTED_ZIP}" "${DAY9_GLOB}"`, { encoding: 'utf-8' })
  } catch {
    return null
  }
}

function readDayFiles() {
  const files = readdirSync(SRC_DIR)
    .filter(f => f.startsWith('Day '))
    .sort((a, b) => parseInt(a.match(/Day (\d+)/)[1], 10) - parseInt(b.match(/Day (\d+)/)[1], 10))

  const days = files.map(f => ({
    file: f,
    content: readFileSync(join(SRC_DIR, f), 'utf-8'),
  }))

  // Day 9 is missing on disk due to filename glitch — extract from zip
  if (!days.some(d => /Day 9/.test(d.file))) {
    const day9 = readDay9()
    if (day9) days.push({ file: 'Day 9 (1).md', content: day9 })
  }
  return days
}

function parseDay({ file, content }) {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const rawTitle = titleMatch?.[1] ?? file
  // "Day 1 <A> (1)" → "Day 1 A"
  const cleanTitle = rawTitle
    .replace(/[<>]/g, '')
    .replace(/\s*\(\d+\)\s*$/, '')
    .trim()

  // Parse rows (skip header + separator)
  const lines = content.split('\n').filter(l => l.trim().startsWith('|'))
  if (lines.length < 3) return { title: cleanTitle, exercises: [] }

  const dataLines = lines.slice(2) // skip header & separator
  const exercises = []
  for (const line of dataLines) {
    const cells = line.split('|').slice(1, -1).map(c => c.trim())
    if (cells.every(c => !c)) continue

    const [rawName, rawWeight, rawSetsReps, rawRest /*, rawP, rawDone*/] = cells

    // Extract name + URL from markdown link or plain text
    const linkMatch = rawName?.match(/\[(.+?)\]\((.+?)\)/)
    const name = linkMatch ? linkMatch[1].trim() : (rawName ?? '').replace(/^\[|\]$/g, '').trim()
    const url  = linkMatch?.[2]
    const ytId = url ? extractYouTubeId(url) : null

    if (!name) continue

    const sr = parseSetsReps(rawSetsReps)
    exercises.push({
      sourceName:    name,
      sourceYoutube: ytId,
      sets:          sr?.sets ?? 3,
      reps:          sr ? { min: sr.min, max: sr.max } : { min: 8, max: 10 },
      restSeconds:   parseRest(rawRest),
      plannedWeight: parseWeight(rawWeight),
    })
  }
  return { title: cleanTitle, exercises }
}

function normalize(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

async function buildExerciseIndex() {
  const all = await prisma.exercise.findMany()
  const byYtId = new Map()
  const byName = new Map()
  for (const ex of all) {
    const id = ex.videoUrl ? extractYouTubeId(ex.videoUrl) : null
    if (id) byYtId.set(id, ex)
    byName.set(normalize(ex.name), ex)
  }
  return { all, byYtId, byName }
}

function matchExercise(item, idx) {
  const override = OVERRIDES[item.sourceName]
  if (override) {
    const target = idx.byName.get(normalize(override))
    if (target) return { match: target, how: 'override' }
  }
  if (item.sourceYoutube && idx.byYtId.has(item.sourceYoutube)) {
    return { match: idx.byYtId.get(item.sourceYoutube), how: 'youtubeId' }
  }
  const n = normalize(item.sourceName)
  if (idx.byName.has(n)) return { match: idx.byName.get(n), how: 'exactName' }

  // Fuzzy: substring match
  const candidates = idx.all.filter(e => normalize(e.name).includes(n) || n.includes(normalize(e.name)))
  if (candidates.length === 1) return { match: candidates[0], how: 'substring' }
  if (candidates.length > 1)   return { match: null, how: 'ambiguous', candidates: candidates.map(c => c.name) }
  return { match: null, how: 'not-found' }
}

async function main() {
  const idx  = await buildExerciseIndex()
  const days = readDayFiles().map(parseDay)

  let totalExercises = 0
  let matched = 0
  const warnings = []

  for (const day of days) {
    console.log(`\n┏━━━ ${day.title} ━━━ (${day.exercises.length} упр.)`)
    for (const item of day.exercises) {
      totalExercises++
      const result = matchExercise(item, idx)
      if (result.match) {
        matched++
        const repsStr = item.reps.max ? `${item.reps.min}-${item.reps.max}` : String(item.reps.min)
        const weightStr = item.plannedWeight != null ? ` · ${item.plannedWeight}кг` : ''
        const restStr = `${item.restSeconds}с`
        const matchTag = result.how === 'youtubeId' ? '✓' : result.how === 'exactName' ? '≈' : '~'
        console.log(`  ${matchTag} ${result.match.name.padEnd(50)} ${item.sets}×${repsStr.padEnd(8)} ${restStr.padStart(5)}${weightStr}`)
      } else {
        console.log(`  ✗ ${item.sourceName}    [${result.how}${result.candidates ? ': ' + result.candidates.join(', ') : ''}]`)
        warnings.push({ day: day.title, item: item.sourceName, reason: result.how, candidates: result.candidates })
      }
    }
  }

  console.log(`\nTotal: ${matched}/${totalExercises} matched`)
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`)
    for (const w of warnings) console.log(`  - "${w.day}" → "${w.item}" [${w.reason}${w.candidates ? ': ' + w.candidates.join(' | ') : ''}]`)
  }

  if (!APPLY) {
    console.log('\n(Preview only. Re-run with --apply to write to DB.)')
    return
  }

  console.log('\n=== APPLYING ===')

  // Sanity: program exists
  const program = await prisma.program.findUnique({ where: { id: PROGRAM_ID } })
  if (!program) throw new Error(`Program ${PROGRAM_ID} not found`)

  // Drop existing templates for this program (idempotency)
  await prisma.workoutTemplate.deleteMany({ where: { programId: PROGRAM_ID } })

  for (let i = 0; i < days.length; i++) {
    const day = days[i]
    const template = await prisma.workoutTemplate.create({
      data: { programId: PROGRAM_ID, order: i, name: day.title },
    })

    for (let j = 0; j < day.exercises.length; j++) {
      const item = day.exercises[j]
      const result = matchExercise(item, idx)
      if (!result.match) continue
      const targetVolume = {
        type: 'reps',
        min:  item.reps.min,
        ...(item.reps.max ? { max: item.reps.max } : {}),
      }
      await prisma.workoutTemplateExercise.create({
        data: {
          templateId:    template.id,
          exerciseId:    result.match.id,
          order:         j,
          targetSets:    item.sets,
          targetVolume,
          restSeconds:   item.restSeconds,
          plannedWeight: item.plannedWeight,
        },
      })
    }
    console.log(`  Created template: ${day.title}`)
  }

  // Update cycleLength
  await prisma.program.update({
    where: { id: PROGRAM_ID },
    data:  { cycleLength: days.length },
  })
  console.log(`Updated cycleLength → ${days.length}`)

  // Sanity check
  const updated = await prisma.program.findUnique({
    where: { id: PROGRAM_ID },
    include: { templates: { include: { exercises: true } } },
  })
  console.log(`Final: ${updated.templates.length} templates, ${updated.templates.reduce((s, t) => s + t.exercises.length, 0)} exercises total`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
