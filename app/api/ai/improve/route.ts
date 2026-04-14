import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/ai/encrypt'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting en mémoire — simple, suffisant pour un groupe fermé de 5–50 membres
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
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

// Prompts système — mode AMÉLIORATION (texte existant >= 50 chars)
const IMPROVE_PROMPTS: Record<string, string> = {
  description: 'Tu es un expert en rédaction de mémos d\'investissement. Améliore ce texte : plus percutant, structuré, professionnel. Conserve les faits. Réponds uniquement avec le texte amélioré, sans commentaires.',
  problem: 'Tu es un expert en rédaction de mémos d\'investissement. Reformule ce problème de manière plus précise et impactante, en mettant en valeur l\'urgence et la taille du marché. Réponds uniquement avec le texte amélioré.',
  solution: 'Tu es un expert en mémos d\'investissement. Améliore cette description de solution pour mettre en valeur la différenciation et le potentiel de scalabilité. Réponds uniquement avec le texte amélioré.',
  value_proposition: 'Tu es un expert en mémos d\'investissement. Affine cette proposition de valeur pour qu\'elle soit mémorable, précise et orientée résultats. Réponds uniquement avec le texte amélioré.',
  key_risks: 'Tu es un expert en analyse de risques d\'investissement. Restructure ces risques de façon exhaustive et hiérarchisée (probabilité × impact). Réponds uniquement avec le texte amélioré.',
  key_hypotheses: 'Tu es un expert en investissement. Reformule ces hypothèses de façon plus précise et testable. Chaque hypothèse doit être mesurable. Réponds uniquement avec le texte amélioré.',
  statement: 'Tu es un expert en thèses d\'investissement. Améliore cette thèse pour la rendre plus convaincante, logique et mémorable. Réponds uniquement avec le texte amélioré.',
  commentary: 'Tu es un expert en évaluation de projets d\'investissement. Améliore ce commentaire d\'évaluation pour le rendre plus structuré et argumenté. Réponds uniquement avec le texte amélioré.',
  red_team: 'Tu es un expert en Red Team d\'investissement. Améliore ce contre-argument pour le rendre plus incisif, précis et convaincant. Réponds uniquement avec le texte amélioré.',
  hypothesis: 'Tu es un expert en investissement. Reformule cette hypothèse pour la rendre plus précise, mesurable et testable (une seule phrase). Réponds uniquement avec le texte amélioré.',
  default: 'Tu es un expert en rédaction professionnelle. Améliore ce texte pour le rendre plus clair, concis et percutant. Réponds uniquement avec le texte amélioré.',
}

// Prompts système — mode GÉNÉRATION (hint court < 50 chars)
const GENERATE_PROMPTS: Record<string, string> = {
  description: 'Tu es un expert en rédaction de mémos d\'investissement. À partir de ce contexte/titre, rédige une description de projet percutante et professionnelle (150–250 mots). Réponds uniquement avec le texte rédigé.',
  problem: 'Tu es un expert en mémos d\'investissement. À partir de ce contexte, rédige une description du problème marché : urgence, taille du problème, pourquoi maintenant (150–200 mots). Réponds uniquement avec le texte rédigé.',
  solution: 'Tu es un expert en mémos d\'investissement. À partir de ce contexte, rédige une description de solution différenciante : approche unique, mécanisme de valeur, scalabilité (150–200 mots). Réponds uniquement avec le texte rédigé.',
  value_proposition: 'Tu es un expert en mémos d\'investissement. À partir de ce contexte, rédige une proposition de valeur mémorable et orientée résultats (50–100 mots, format concis et impactant). Réponds uniquement avec le texte rédigé.',
  key_risks: 'Tu es un expert en analyse de risques d\'investissement. À partir de ce contexte, liste les 4–5 risques principaux hiérarchisés par probabilité × impact (format : • Risque X : description). Réponds uniquement avec la liste.',
  key_hypotheses: 'Tu es un expert en investissement. À partir de ce contexte, rédige 3 hypothèses vérifiables et mesurables que le projet doit valider pour réussir (format : • Hypothèse X : [condition mesurable]). Réponds uniquement avec les hypothèses.',
  statement: 'Tu es un expert en thèses d\'investissement. À partir de ce contexte, rédige une thèse d\'investissement structurée (100–150 mots) : conviction, catalyseurs, retour attendu. Réponds uniquement avec la thèse.',
  commentary: 'Tu es un expert en évaluation de projets d\'investissement. À partir de ce contexte, rédige un commentaire d\'évaluation structuré (forces, faiblesses, score justifié) de 100–150 mots. Réponds uniquement avec le commentaire.',
  red_team: 'Tu es un expert Red Team en investissement. À partir de ce contexte, rédige un contre-argument structuré et percutant qui identifie la faille principale du projet (80–120 mots). Réponds uniquement avec le texte rédigé.',
  hypothesis: 'Tu es un expert en investissement. À partir de ce contexte, propose une hypothèse testable et mesurable que ce projet doit valider pour réussir (une seule phrase). Réponds uniquement avec l\'hypothèse.',
  default: 'Tu es un expert en rédaction professionnelle. À partir de ce contexte, rédige un texte clair, structuré et professionnel (100–200 mots). Réponds uniquement avec le texte rédigé.',
}

// ─── Résolution de clé BYOK depuis la DB ─────────────────────────────────────

type ResolvedKey = { key: string; model: string | null }

async function resolveByokKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- client Supabase générique
  supabase: any,
  userId: string,
  provider: string,
): Promise<ResolvedKey | null> {
  // Priorité : clé personnelle (is_global=false) > clé globale (is_global=true)
  const { data } = await supabase
    .from('api_keys')
    .select('key_encrypted, model')
    .eq('provider', provider)
    .not('key_encrypted', 'is', null)
    .order('is_global', { ascending: true })
    .limit(1)
    .single() as { data: { key_encrypted: string; model: string | null } | null }

  if (!data?.key_encrypted) return null
  const key = await decryptApiKey(data.key_encrypted)
  if (!key) return null
  return { key, model: data.model }
}

// ─── Provider Anthropic (Claude claude-haiku-4-5) ─────────────────────────────────────

async function streamAnthropic(
  systemPrompt: string,
  userContent: string,
  apiKey: string,
  model = 'claude-haiku-4-5-20251001',
): Promise<Response> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent.trim() }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[ai/improve] Anthropic error:', res.status, errText)
    return NextResponse.json({ error: 'Erreur lors de la génération IA. Réessayez.' }, { status: 502 })
  }

  const reader = res.body?.getReader()
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
        const data = line.slice(6).trim()
        try {
          const parsed = JSON.parse(data) as {
            type?: string
            delta?: { type?: string; text?: string }
          }
          // Anthropic stream: content_block_delta avec delta.text
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta' && parsed.delta.text) {
            controller.enqueue(new TextEncoder().encode(parsed.delta.text))
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

  return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

// ─── Provider Kimi / OpenAI-compatible ───────────────────────────────────────

async function streamKimi(
  systemPrompt: string,
  userContent: string,
  apiKey: string,
  model = 'moonshot-v1-8k',
): Promise<Response> {
  const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent.trim() },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[ai/improve] Kimi error:', res.status, errText)
    return NextResponse.json({ error: 'Erreur lors de la génération IA. Réessayez.' }, { status: 502 })
  }

  const reader = res.body?.getReader()
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

  return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

// ─── Handler principal ────────────────────────────────────────────────────────

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
  const body = await req.json() as { field?: string; content?: string; mode?: 'improve' | 'generate' }
  const { field = 'default', content, mode = 'improve' } = body

  if (!content || content.trim().length < 3) {
    return NextResponse.json({ error: 'Le contenu est trop court' }, { status: 400 })
  }
  if (content.length > 3000) {
    return NextResponse.json({ error: 'Le contenu est trop long (max 3000 caractères)' }, { status: 400 })
  }

  const prompts = mode === 'generate' ? GENERATE_PROMPTS : IMPROVE_PROMPTS
  const systemPrompt = prompts[field] ?? prompts.default

  // Résolution des clés — BYOK DB en priorité, env vars en fallback
  // Ordre inter-providers : Kimi d'abord (moins cher), Anthropic en dernier recours
  const kimiByok = await resolveByokKey(supabase, user.id, 'kimi')
  if (kimiByok) {
    return streamKimi(systemPrompt, content, kimiByok.key, kimiByok.model ?? 'moonshot-v1-8k')
  }

  const anthropicByok = await resolveByokKey(supabase, user.id, 'anthropic')
  if (anthropicByok) {
    return streamAnthropic(systemPrompt, content, anthropicByok.key, anthropicByok.model ?? 'claude-haiku-4-5-20251001')
  }

  // Fallback env vars (clés globales serveur configurées par l'admin)
  const kimiEnv = process.env.KIMI_API_KEY
  if (kimiEnv) return streamKimi(systemPrompt, content, kimiEnv)

  const anthropicEnv = process.env.ANTHROPIC_API_KEY
  if (anthropicEnv) return streamAnthropic(systemPrompt, content, anthropicEnv)

  return NextResponse.json(
    { error: 'Aucune clé IA configurée — ajoutez une clé Kimi ou Anthropic dans Paramètres → Clés API.' },
    { status: 503 },
  )
}
