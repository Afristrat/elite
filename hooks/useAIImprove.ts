'use client'

import { useState } from 'react'

type AIMode = 'improve' | 'generate'
type ImproveState = 'idle' | 'loading' | 'error'

type UseAIImproveReturn = {
  run: (content: string, field?: string, mode?: AIMode) => Promise<string | null>
  state: ImproveState
  error: string | null
}

/**
 * Hook pour appeler /api/ai/improve en mode "improve" ou "generate".
 * - generate : produit un texte complet à partir d'un hint court
 * - improve  : améliore un texte existant
 */
export function useAIImprove(): UseAIImproveReturn {
  const [state, setState] = useState<ImproveState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function run(content: string, field = 'default', mode: AIMode = 'improve'): Promise<string | null> {
    if (content.trim().length < 3) {
      setError('Ajoutez quelques mots pour que l\'IA puisse générer du contenu')
      return null
    }

    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ field, content, mode }),
      })

      if (!res.ok) {
        const errData = await res.json() as { error?: string }
        throw new Error(errData.error ?? `Erreur ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('Stream indisponible')

      let result = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
      }

      setState('idle')
      return result.trim() || null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      setState('error')
      return null
    }
  }

  return { run, state, error }
}
