import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function callAnthropic(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')
  return block.text
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini error: ${text}`)
  }
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] }
  return data.candidates[0].content.parts[0].text
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error: ${text}`)
  }
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content
}

// Switch provider via AI_TEXT_PROVIDER env var: "gemini" | "openai" | "anthropic" (default)
export async function callTextModel(prompt: string): Promise<string> {
  switch (process.env.AI_TEXT_PROVIDER) {
    case 'gemini':  return callGemini(prompt)
    case 'openai':  return callOpenAI(prompt)
    default:        return callAnthropic(prompt)
  }
}

export async function callImageModel(prompt: string): Promise<string> {
  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt,
      width: 512,
      height: 512,
      n: 1,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Together AI error: ${text}`)
  }

  const data = await res.json() as { data: { url: string }[] }
  const url = data.data?.[0]?.url
  if (!url) throw new Error('No image URL in response')
  return url
}
