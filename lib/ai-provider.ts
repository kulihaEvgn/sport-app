import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function callTextModel(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')
  return block.text
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
