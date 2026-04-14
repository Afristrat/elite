'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAIImprove } from '@/hooks/useAIImprove'

const GENERATE_THRESHOLD = 50 // < 50 chars → Générer, >= 50 → Améliorer

type AITextAreaProps = {
  value: string
  onChange: (value: string) => void
  field?: string
  placeholder?: string
  rows?: number
  className?: string
  label?: string
  hint?: string
  minLength?: number
  maxLength?: number
  /** Contexte additionnel passé à l'IA en mode génération (ex: titre + secteur du projet) */
  generateContext?: string
}

/**
 * Textarea avec assistance IA intégrée.
 * - < 50 chars  : bouton "✨ Générer" — produit un texte complet depuis le hint
 * - >= 50 chars : bouton "✨ Améliorer" — améliore le texte existant
 * Le texte original est préservé jusqu'à acceptation explicite.
 */
export function AITextArea({
  value,
  onChange,
  field = 'default',
  placeholder,
  rows = 4,
  className,
  label,
  hint,
  minLength,
  maxLength = 2000,
  generateContext,
}: AITextAreaProps): React.JSX.Element {
  const { run, state } = useAIImprove()
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [showError, setShowError] = useState<string | null>(null)

  const isLoading = state === 'loading'
  const charCount = value.length
  const meetsMinLength = !minLength || charCount >= minLength
  const isGenerateMode = charCount < GENERATE_THRESHOLD

  async function handleAI(): Promise<void> {
    setShowError(null)
    setSuggestion(null)

    // En mode génération, on utilise le contenu saisi comme hint + le contexte optionnel
    const input = isGenerateMode
      ? [generateContext, value].filter(Boolean).join(' — ') || value
      : value

    if (input.trim().length < 3) {
      setShowError(isGenerateMode
        ? 'Écrivez quelques mots pour donner un contexte à l\'IA'
        : 'Écrivez au moins quelques mots avant d\'améliorer',
      )
      return
    }

    const result = await run(input, field, isGenerateMode ? 'generate' : 'improve')
    if (result) {
      setSuggestion(result)
    } else {
      setShowError('IA indisponible — vérifiez la clé API dans les paramètres')
    }
  }

  function handleAccept(): void {
    if (suggestion) {
      onChange(suggestion)
      setSuggestion(null)
    }
  }

  function handleDiscard(): void {
    setSuggestion(null)
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-400">{label}</label>
          {minLength && (
            <span className={cn('text-xs', meetsMinLength ? 'text-green-500' : 'text-gray-600')}>
              {charCount}/{minLength} {meetsMinLength && '✓'}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => { onChange(e.target.value) }}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pb-9 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none',
            suggestion ? 'border-blue-600/50' : '',
            className,
          )}
        />

        {/* Bouton IA — positionné en bas à droite de la textarea */}
        <button
          type="button"
          onClick={() => { void handleAI() }}
          disabled={isLoading}
          className={cn(
            'absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border',
            isLoading
              ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-wait'
              : isGenerateMode
                ? 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border-purple-700/60 hover:border-purple-500'
                : 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border-blue-700/50 hover:border-blue-500',
          )}
          title={isGenerateMode ? 'Générer du contenu avec l\'IA' : 'Améliorer ce texte avec l\'IA'}
        >
          {isLoading ? (
            <>
              <span className="animate-spin text-xs inline-block">⟳</span>
              <span>IA…</span>
            </>
          ) : isGenerateMode ? (
            <>
              <span>✨</span>
              <span>Générer</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Améliorer</span>
            </>
          )}
        </button>
      </div>

      {hint && !suggestion && !showError && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}

      {showError && (
        <p className="text-xs text-red-400">{showError}</p>
      )}

      {/* Suggestion IA */}
      {suggestion && (
        <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-300">
              ✨ {isGenerateMode ? 'Contenu généré' : 'Suggestion IA'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAccept}
                className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
              >
                Accepter
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Ignorer
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{suggestion}</p>
        </div>
      )}
    </div>
  )
}
