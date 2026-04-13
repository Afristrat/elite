import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // 5 requêtes par minute (Perplexity est plus coûteux)
const RATE_WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export type MarketResearchResult = {
  market_size: string
  growth_rate: string
  key_players: string[]
  trends: string[]
  risks: string[]
  opportunity: string
}

export async function POST(req: NextRequest): Promise<Response> {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Rate limiting
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Limite atteinte (5/min). Réessayez dans une minute.' },
      { status: 429 },
    )
  }

  const body = await req.json() as { sector?: string; description?: string; title?: string }
  const { sector, description, title } = body

  if (!sector && !description) {
    return NextResponse.json({ error: 'Secteur ou description requis' }, { status: 400 })
  }

  // Clé API Perplexity
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Clé API Perplexity non configurée. Contactez l\'administrateur.' },
      { status: 503 },
    )
  }

  const query = [
    title ? `Projet : ${title}` : null,
    sector ? `Secteur : ${sector}` : null,
    description ? `Description : ${description.slice(0, 500)}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `Effectue une analyse de marché concise pour le contexte suivant :

${query}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "market_size": "taille estimée du marché (ex: 2,4 Md EUR en 2024)",
  "growth_rate": "taux de croissance annuel estimé (ex: +12% CAGR 2024-2028)",
  "key_players": ["acteur 1", "acteur 2", "acteur 3"],
  "trends": ["tendance 1", "tendance 2", "tendance 3"],
  "risks": ["risque marché 1", "risque marché 2"],
  "opportunity": "description concise de l'opportunité (2-3 phrases)"
}

Ne fournis que le JSON, sans texte avant ou après.`

  const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'Tu es un analyste financier expert. Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans texte supplémentaire.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.2,
    }),
  })

  if (!perplexityRes.ok) {
    const errText = await perplexityRes.text()
    console.error('[ai/market-research] Perplexity error:', perplexityRes.status, errText)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche marché. Réessayez.' },
      { status: 502 },
    )
  }

  const perplexityData = await perplexityRes.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const rawContent = perplexityData.choices?.[0]?.message?.content ?? ''

  // Parser le JSON de réponse
  try {
    const result = JSON.parse(rawContent) as MarketResearchResult
    return NextResponse.json({ success: true, data: result })
  } catch {
    // Tenter d'extraire le JSON si du texte a été ajouté
    const match = rawContent.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const result = JSON.parse(match[0]) as MarketResearchResult
        return NextResponse.json({ success: true, data: result })
      } catch {
        // Tombée dans le fallback ci-dessous
      }
    }
    console.error('[ai/market-research] Parse error:', rawContent)
    return NextResponse.json(
      { error: 'Résultat IA inattendu. Réessayez.' },
      { status: 502 },
    )
  }
}
