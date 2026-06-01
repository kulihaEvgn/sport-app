import { NextRequest, NextResponse } from 'next/server'
import { callImageModel } from '@/lib/ai-provider'

export async function POST(req: NextRequest) {
  try {
    const { name, muscleGroup, equipment } = await req.json() as {
      name: string
      muscleGroup: string
      equipment: string
    }

    const prompt = `Fitness exercise photograph: ${name}, targeting ${muscleGroup} muscles, using ${equipment}. Professional gym setting, clean white background, athletic person demonstrating proper form. High quality, realistic.`

    const imageUrl = await callImageModel(prompt)
    return NextResponse.json({ imageUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
