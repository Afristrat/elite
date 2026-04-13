import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting en mémoire — simple, suffisant pour un groupe fermé de 5–50 membres
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10 // 10 requêtes
const RATE_WINDOW_MS = 60_000 // par minute

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

// Prompts système par type de champ
const FIELD_PROMPTS: Record<string, string> = {
  description: 'Tu es un expert en rédaction de mémos d\'investissement. Améliore ce texte : plus percutant, structuré, professionnel. Conserve les faits. Réponds uniquement avec le texte amélioré, sans commentaires.',
  problem: 'Tu es un expert en rédaction de mémos d\'investissement. Reformule ce problème de manière plus précise et impactante, en mettant en valeur l\'urgence et la taille du marché. Réponds uniquement avec le texte amélioré.',
  solution: 'Tu es un expert en rédaction de mémos d\'investissement. Améliore cette description de solution pour mettre en valeur la différenciation et le potentiel de scalabilité. Réponds uniquement avec le texte amélioré.',
  value_proposition: 'Tu es un expert en rédaction de mémos d\'investissement. Affine cette proposition de valeur pour qu\'elle soit mémorable, précise et orientée résultats. Réponds uniquement avec le texte amélioré.',
  key_risks: 'Tu es un expert en analyse de risques d\'investissement. Restructure ces risques de façon exhaustive et hiérarchisée (probabilité × impact). Réponds uniquement avec le texte amélioré.',
  key_hypotheses: 'Tu es un expert en investissement. Reformule ces hypothèses de façon plus précise et testable. Chaque hypothèse doit être mesurable. Réponds uniquement avec le texte amélioré.',
  statement: 'Tu es un expert en thèses d\'investissement. Améliore cette thèse pour la rendre plus convaincante, logique et mémorable. Réponds uniquement avec le texte amélioré.',
  commentary: 'Tu es un expert en évaluation de projets d\'investissement. Améliore ce commentaire d\'évaluation pour le rendre plus structuré et argumenté. Réponds uniquement avec le texte amélioré.',
  default: 'Tu es un expert en rédaction professionnelle. Améliore ce texte pour le rendre plus clair, concis et percutant. Réponds uniquement avec le texte amélioré.',
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
      { error: 'Limite de requêtes atteinte (10/min). Réessayez dans une minute.' },
      { status: 429 },
    )
  }

  // Payload
  const body = await req.json() as { field?: string; content?: string }
  const { field = 'default', content } = body

  if (!content || content.trim().length < 10) {
    return NextResponse.json({ error: 'Le contenu est trop court (min 10 caractères)' }, { status: 400 })
  }
  if (content.length > 3000) {
    return NextResponse.json({ error: 'Le contenu est trop long (max 3000 caractères)' }, { status: 400 })
  }

  // Clé API Kimi (Moonshot AI)
  const apiKey = process.env.KIMI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Clé API Kimi non configurée. Contactez l\'administrateur.' },
      { status: 503 },
    )
  }

  const systemPrompt = FIELD_PROMPTS[field] ?? FIELD_PROMPTS.default

  // Appel Kimi API — format OpenAI compatible, streaming SSE standard
  const kimiRes = await fetch('https://api.moonshot.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content.trim() },
      ],
    }),
  })

  if (!kimiRes.ok) {
    const errText = await kimiRes.text()
    console.error('[ai/improve] Kimi error:', kimiRes.status, errText)
    return NextResponse.json(
      { error: 'Erreur lors de la génération IA. Réessayez.' },
      { status: 502 },
    )
  }

  // Transformer le stream Kimi SSE (format OpenAI) en stream text simple
  const reader = kimiRes.body?.getReader()
  if (!reader) {
    return NextResponse.json({ error: 'Stream indisponible' }, { status: 502 })
  }

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }

      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') {
          controller.close()
          return
        }
        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>
          }
          const text = parsed.choices?.[0]?.delta?.content
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        } catch {
          // Ignorer les lignes SSE non JSON
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
