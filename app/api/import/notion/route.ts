import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'

interface NotionProperty {
  type: string
  title?: { plain_text: string }[]
  rich_text?: { plain_text: string }[]
  select?: { name: string } | null
  multi_select?: { name: string }[]
  url?: string | null
  email?: string | null
  number?: number | null
}

interface NotionPage {
  properties: Record<string, NotionProperty>
}

function extractText(prop: NotionProperty | undefined): string {
  if (!prop) return ''
  switch (prop.type) {
    case 'title':       return prop.title?.map(t => t.plain_text).join('') ?? ''
    case 'rich_text':   return prop.rich_text?.map(t => t.plain_text).join('') ?? ''
    case 'select':      return prop.select?.name ?? ''
    case 'multi_select': return prop.multi_select?.map(s => s.name).join(', ') ?? ''
    case 'url':         return prop.url ?? ''
    case 'email':       return prop.email ?? ''
    case 'number':      return prop.number != null ? String(prop.number) : ''
    default:            return ''
  }
}

export async function POST(req: NextRequest) {
  let body: { token?: string; databaseId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { token, databaseId } = body
  if (!token || !databaseId) {
    return NextResponse.json({ error: 'token и databaseId обязательны' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Notion API: ${res.status} ${text.slice(0, 200)}` }, { status: 502 })
    }

    const data = await res.json() as { results: NotionPage[] }
    const rows = data.results.map(page => {
      const row: Record<string, string> = {}
      for (const [key, value] of Object.entries(page.properties)) {
        row[key] = extractText(value)
      }
      return row
    })

    return NextResponse.json({ rows })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Network error' }, { status: 500 })
  }
}
