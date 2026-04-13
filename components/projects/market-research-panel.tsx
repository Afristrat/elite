'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { MarketResearchResult } from '@/app/api/ai/market-research/route'

type Props = {
  sector?: string
  description?: string
  title?: string
  onApply?: (data: { problem?: string; key_risks?: string }) => void
}

/**
 * Panneau de recherche marché via Perplexity.
 * Affiche les résultats structurés (taille marché, tendances, acteurs, risques).
 * Optionnellement, injecte les risques dans le champ key_risks du formulaire.
 */
export function MarketResearchPanel({ sector, description, title, onApply }: Props): React.JSX.Element {
  const [result, setResult] = useState<MarketResearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  async function handleSearch(): Promise<void> {
    if (!sector && !description) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/market-research', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sector, description, title }),
      })

      const data = await res.json() as { success?: boolean; data?: MarketResearchResult; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      setResult(data.data ?? null)
      setIsExpanded(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  function handleApplyRisks(): void {
    if (!result || !onApply) return
    const risksText = result.risks.map((r) => `• ${r}`).join('\n')
    onApply({ key_risks: risksText })
  }

  const hasContext = Boolean(sector || description)

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3',
        isExpanded ? 'bg-purple-950/20 border-b border-purple-900/40' : 'bg-gray-900',
      )}>
        <div className="flex items-center gap-2">
          <span className="text-sm">🔍</span>
          <p className="text-sm font-semibold text-gray-200">Recherche marché — Perplexity</p>
          {result && <span className="text-xs bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded">Résultats disponibles</span>}
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              type="button"
              onClick={() => { setIsExpanded((v) => !v) }}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              {isExpanded ? 'Réduire' : 'Afficher'}
            </button>
          )}
          <button
            type="button"
            onClick={() => { void handleSearch() }}
            disabled={isLoading || !hasContext}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              hasContext && !isLoading
                ? 'bg-purple-700 hover:bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed',
            )}
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-xs">⟳</span>
                <span>Recherche…</span>
              </>
            ) : (
              <>{result ? 'Relancer' : 'Analyser le marché'}</>
            )}
          </button>
        </div>
      </div>

      {!hasContext && !result && (
        <div className="px-4 py-2 bg-gray-900">
          <p className="text-xs text-gray-600">Renseignez le secteur ou la description pour activer l&apos;analyse.</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Résultats */}
      {result && isExpanded && (
        <div className="bg-gray-900 p-4 space-y-4">
          {/* Taille et croissance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 space-y-0.5">
              <p className="text-xs text-gray-500">Taille de marché</p>
              <p className="text-sm font-semibold text-white">{result.market_size}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 space-y-0.5">
              <p className="text-xs text-gray-500">Croissance</p>
              <p className="text-sm font-semibold text-green-400">{result.growth_rate}</p>
            </div>
          </div>

          {/* Opportunité */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400">Opportunité</p>
            <p className="text-xs text-gray-300 leading-relaxed">{result.opportunity}</p>
          </div>

          {/* Tendances */}
          {result.trends.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400">Tendances clés</p>
              <ul className="space-y-1">
                {result.trends.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acteurs */}
          {result.key_players.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400">Acteurs clés</p>
              <div className="flex flex-wrap gap-1.5">
                {result.key_players.map((p, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risques */}
          {result.risks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400">Risques marché</p>
                {onApply && (
                  <button
                    type="button"
                    onClick={handleApplyRisks}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    → Injecter dans les risques
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                {result.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-600">
            Données issues de Perplexity AI — à vérifier avec des sources primaires avant décision.
          </p>
        </div>
      )}
    </div>
  )
}
