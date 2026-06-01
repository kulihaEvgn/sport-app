import { NextRequest, NextResponse } from 'next/server'
import { callTextModel } from '@/lib/ai-provider'

export async function POST(req: NextRequest) {
  try {
    const { name, muscleGroup, equipment } = await req.json() as {
      name: string
      muscleGroup: string
      equipment: string
    }

    const prompt = `Ты — эксперт по силовым тренировкам. Напиши описание упражнения на русском языке.

Упражнение: ${name}
Группа мышц: ${muscleGroup}
Инвентарь: ${equipment}

Верни ТОЛЬКО JSON без markdown-блоков, строго в формате:
{
  "description": "Краткое описание упражнения и его польза (2-3 предложения)",
  "technique": "Техника выполнения по шагам (3-5 шагов)",
  "commonMistakes": "Типичные ошибки (2-3 ошибки)"
}`

    const text = await callTextModel(prompt)

    let parsed: { description: string; technique: string; commonMistakes: string }
    try {
      parsed = JSON.parse(text.trim())
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Failed to parse AI response')
      parsed = JSON.parse(match[0])
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
