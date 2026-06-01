interface ExerciseDescriptionResult {
  description: string
  technique: string
  commonMistakes: string
}

interface GenerateProgramParams {
  daysPerWeek: number
  goal: 'mass' | 'strength' | 'endurance' | 'fatLoss'
  level: 'beginner' | 'intermediate' | 'advanced'
  availableExercises: { id: string; name: string; muscleGroup: string; equipment: string }[]
}

async function postAI<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/ai/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json() as { error?: string }
    throw new Error(data.error ?? `AI request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function generateExerciseDescription(params: {
  name: string
  muscleGroup: string
  equipment: string
}): Promise<ExerciseDescriptionResult> {
  return postAI<ExerciseDescriptionResult>('generate-exercise', params)
}

export async function generateExerciseImage(params: {
  name: string
  muscleGroup: string
  equipment: string
}): Promise<string> {
  const data = await postAI<{ imageUrl: string }>('generate-image', params)
  return data.imageUrl
}

export async function generateProgram(params: GenerateProgramParams) {
  return postAI<{ program: unknown }>('generate-program', params)
}
