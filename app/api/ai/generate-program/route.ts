import { NextRequest, NextResponse } from 'next/server'
import { callTextModel } from '@/lib/ai-provider'

interface AvailableExercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
}

interface GenerateProgramBody {
  daysPerWeek: number
  goal: 'mass' | 'strength' | 'endurance' | 'fatLoss'
  level: 'beginner' | 'intermediate' | 'advanced'
  availableExercises: AvailableExercise[]
}

const GOAL_LABELS: Record<string, string> = {
  mass: 'набор мышечной массы',
  strength: 'развитие силы',
  endurance: 'повышение выносливости',
  fatLoss: 'снижение веса и жиросжигание',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'начинающий',
  intermediate: 'средний уровень',
  advanced: 'продвинутый',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateProgramBody
    const { daysPerWeek, goal, level, availableExercises } = body

    const exerciseList = availableExercises
      .map(e => `- id: "${e.id}", name: "${e.name}", muscleGroup: "${e.muscleGroup}", equipment: "${e.equipment}"`)
      .join('\n')

    const prompt = `Ты — тренер по силовым тренировкам. Создай программу тренировок на русском языке.

Параметры:
- Дней в неделю: ${daysPerWeek}
- Цель: ${GOAL_LABELS[goal]}
- Уровень: ${LEVEL_LABELS[level]}

Доступные упражнения (используй ТОЛЬКО их ID):
${exerciseList}

Верни ТОЛЬКО JSON без markdown-блоков строго в формате:
{
  "name": "Название программы",
  "description": "Краткое описание программы (1-2 предложения)",
  "templates": [
    {
      "name": "День 1 — Название",
      "exercises": [
        {
          "exerciseId": "id из списка выше",
          "targetSets": 3,
          "targetVolume": { "type": "reps", "min": 8, "max": 12 },
          "restSeconds": 90,
          "plannedWeight": 50
        }
      ]
    }
  ]
}

Правила:
- Количество templates = ${daysPerWeek}
- Для каждого дня выбери 4-6 упражнений из списка
- targetVolume.type = "reps" для силовых, "time" (seconds) для планки/кардио
- plannedWeight — разумный начальный вес в кг (или 0 если без веса)
- Чередуй группы мышц между днями`

    const text = await callTextModel(prompt)

    let parsed: {
      name: string
      description: string
      templates: Array<{
        name: string
        exercises: Array<{
          exerciseId: string
          targetSets: number
          targetVolume: { type: 'reps'; min: number; max?: number } | { type: 'time'; seconds: number }
          restSeconds: number
          plannedWeight?: number
        }>
      }>
    }

    try {
      parsed = JSON.parse(text.trim())
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Failed to parse AI response')
      parsed = JSON.parse(match[0])
    }

    return NextResponse.json({ program: parsed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
