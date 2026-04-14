import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type TestKeyBody = {
  provider?: string
  keyValue?: string
  model?: string
}

type ProviderError = {
  error?: { message?: string; code?: string }
  detail?: string
  message?: string
}

type ProviderConfig = {
  url: string
  buildHeaders: (key: string) => Record<string, string>
  body: unknown
}

// Helpers pour éviter la répétition
const openAICompat = (url: string, model: string, key: string): ProviderConfig => ({
  url,
  buildHeaders: () => ({ Authorization: `Bearer ${key}`, 'content-type': 'application/json' }),
  body: { model, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] },
})

// Configs par provider — max_tokens=1 pour limiter le coût au strict minimum
function buildConfig(provider: string, key: string, model?: string): ProviderConfig | null {
  // Modèle effectif : celui fourni par l'UI, sinon fallback sur le modèle le moins cher du provider
  const DEFAULT_MODELS: Record<string, string> = {
    openai: 'gpt-4o-mini', anthropic: 'claude-haiku-4-5-20251001', google: 'gemini-2.5-flash-lite',
    mistral: 'mistral-small-2503', groq: 'llama-3.1-8b-instant', cohere: 'command-r-08-2024',
    perplexity: 'sonar', xai: 'grok-3-mini-beta',
    together: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
    fireworks: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    kimi: 'moonshot-v1-8k', deepseek: 'deepseek-chat', qwen: 'qwen-turbo',
    zhipu: 'glm-4-flash', doubao: 'doubao-lite-4k', yi: 'yi-lightning',
    minimax: 'abab5.5s-chat', baichuan: 'Baichuan4-Turbo', stepfun: 'step-1-flash',
    siliconflow: 'Qwen/Qwen3-8B', hunyuan: 'hunyuan-lite', spark: 'lite',
  }
  const effectiveModel = model?.trim() || DEFAULT_MODELS[provider] || ''

  switch (provider) {
    // ── Américains / Européens ──────────────────────────────────────────────
    case 'openai':
      return openAICompat('https://api.openai.com/v1/chat/completions', effectiveModel, key)

    case 'anthropic':
      return {
        url: 'https://api.anthropic.com/v1/messages',
        buildHeaders: () => ({
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }),
        body: { model: effectiveModel, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] },
      }

    case 'google':
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${key}`,
        buildHeaders: () => ({ 'content-type': 'application/json' }),
        body: { contents: [{ parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 1 } },
      }

    case 'mistral':
      return openAICompat('https://api.mistral.ai/v1/chat/completions', effectiveModel, key)

    case 'groq':
      return openAICompat('https://api.groq.com/openai/v1/chat/completions', effectiveModel, key)

    case 'cohere':
      return {
        url: 'https://api.cohere.com/v2/chat',
        buildHeaders: () => ({ Authorization: `Bearer ${key}`, 'content-type': 'application/json' }),
        body: { model: effectiveModel, messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 },
      }

    case 'perplexity':
      return openAICompat('https://api.perplexity.ai/chat/completions', effectiveModel, key)

    case 'xai':
      return openAICompat('https://api.x.ai/v1/chat/completions', effectiveModel, key)

    case 'together':
      return openAICompat('https://api.together.xyz/v1/chat/completions', effectiveModel, key)

    case 'fireworks':
      return openAICompat('https://api.fireworks.ai/inference/v1/chat/completions', effectiveModel, key)

    // ── Chinois ─────────────────────────────────────────────────────────────
    case 'kimi':
      return openAICompat('https://api.moonshot.ai/v1/chat/completions', effectiveModel, key)

    case 'deepseek':
      return openAICompat('https://api.deepseek.com/v1/chat/completions', effectiveModel, key)

    case 'qwen':
      return openAICompat('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', effectiveModel, key)

    case 'zhipu':
      return openAICompat('https://open.bigmodel.cn/api/paas/v4/chat/completions', effectiveModel, key)

    case 'doubao':
      return openAICompat('https://ark.cn-beijing.volces.com/api/v3/chat/completions', effectiveModel, key)

    case 'yi':
      return openAICompat('https://api.lingyiwanwu.com/v1/chat/completions', effectiveModel, key)

    case 'minimax':
      return {
        url: 'https://api.minimax.chat/v1/text/chatcompletion_pro',
        buildHeaders: () => ({ Authorization: `Bearer ${key}`, 'content-type': 'application/json' }),
        body: {
          model: effectiveModel,
          tokens_to_generate: 1,
          messages: [{ sender_type: 'USER', sender_name: 'test', text: 'hi' }],
        },
      }

    case 'baichuan':
      return openAICompat('https://api.baichuan-ai.com/v1/chat/completions', effectiveModel, key)

    case 'stepfun':
      return openAICompat('https://api.stepfun.com/v1/chat/completions', effectiveModel, key)

    case 'siliconflow':
      return openAICompat('https://api.siliconflow.cn/v1/chat/completions', effectiveModel, key)

    case 'hunyuan':
      return openAICompat('https://api.hunyuan.cloud.tencent.com/v1/chat/completions', effectiveModel, key)

    case 'spark':
      return openAICompat('https://spark-api-open.xf-yun.com/v1/chat/completions', effectiveModel, key)

    default:
      return null
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json() as TestKeyBody
  const { provider, keyValue, model } = body

  if (!keyValue?.trim() || keyValue.trim().length < 8) {
    return NextResponse.json({ success: false, error: 'Clé trop courte ou manquante' })
  }

  const config = buildConfig(provider ?? '', keyValue.trim(), model)
  if (!config) {
    return NextResponse.json({
      success: false,
      error: 'Test non disponible pour ce provider — vérifiez la clé manuellement',
    })
  }

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: config.buildHeaders(keyValue.trim()),
      body: JSON.stringify(config.body),
      signal: AbortSignal.timeout(10_000),
    })

    if (res.ok) return NextResponse.json({ success: true })

    // Clé invalide
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ success: false, error: 'Clé invalide ou révoquée' })
    }

    // Quota épuisé mais clé valide
    if (res.status === 402) {
      return NextResponse.json({ success: true, warning: 'Quota épuisé — clé valide mais solde insuffisant' })
    }

    // Modèle introuvable (endpoint Doubao user-specific, etc.) — clé valide
    if (res.status === 404) {
      return NextResponse.json({ success: true, warning: 'Clé valide — configurez l\'identifiant de modèle dans l\'app' })
    }

    const data = await res.json() as ProviderError
    const message = data?.error?.message ?? data?.detail ?? data?.message ?? `Erreur ${res.status}`
    return NextResponse.json({ success: false, error: message })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError'
    return NextResponse.json(
      { success: false, error: isTimeout ? 'Délai dépassé — provider injoignable' : 'Impossible de contacter le provider' },
      { status: 502 },
    )
  }
}
