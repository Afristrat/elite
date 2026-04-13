'use client'

import { useState } from 'react'

type ImproveState = 'idle' | 'loading' | 'error'

type UseAIImproveReturn = {
  improve: (content: string, field?: string) => Promise<string | null>
  state: ImproveState
  error: string | null
}

/**
 * Hook pour appeler /api/ai/improve et obtenir une version améliorée d'un texte.
 * Retourne le texte amélioré ou null en cas d'erreur.
 */
export function useAIImprove(): UseAIImproveReturn {
  const [state, setState] = useState<ImproveState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function improve(content: string, field = 'default'): Promise<string | null> {
    if (content.trim().length < 10) {
      setError('Le texte est trop court pour être amélioré (min 10 caractères)')
      return null
    }

    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ field, content }),
      })

      if (!res.ok) {
        const errData = await res.json() as { error?: string }
        throw new Error(errData.error ?? `Erreur ${res.status}`)
      }

      // Lire le stream text
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

  return { improve, state, error }
}
