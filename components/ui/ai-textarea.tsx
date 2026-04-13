'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAIImprove } from '@/hooks/useAIImprove'

type AITextAreaProps = {
  value: string
  onChange: (value: string) => void
  field?: string
  placeholder?: string
  rows?: number
  className?: string
  minLength?: number
  maxLength?: number
  label?: string
  hint?: string
}

/**
 * Textarea avec bouton "✨ Améliorer avec l'IA".
 * Intègre useAIImprove pour une amélioration en un clic.
 * Le texte original est conservé jusqu'à acceptation explicite.
 */
export function AITextArea({
  value,
  onChange,
  field = 'default',
  placeholder,
  rows = 4,
  className,
  minLength,
  maxLength = 2000,
  label,
  hint,
}: AITextAreaProps): React.JSX.Element {
  const { improve, state } = useAIImprove()
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [showError, setShowError] = useState<string | null>(null)

  const isLoading = state === 'loading'
  const charCount = value.length
  const meetsMinLength = !minLength || charCount >= minLength

  async function handleImprove(): Promise<void> {
    setShowError(null)
    setSuggestion(null)

    if (!meetsMinLength) {
      setShowError(`Écrivez au moins ${minLength} caractères avant d'utiliser l'IA`)
      return
    }

    const result = await improve(value, field)
    if (result) {
      setSuggestion(result)
    } else {
      setShowError('Amélioration indisponible — vérifiez la configuration des clés API')
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
            'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none',
            suggestion ? 'border-blue-600/50' : '',
            className,
          )}
        />
        {/* Bouton IA */}
        <button
          type="button"
          onClick={() => { void handleImprove() }}
          disabled={isLoading || !value.trim()}
          className={cn(
            'absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
            isLoading
              ? 'bg-gray-700 text-gray-400 cursor-wait'
              : 'bg-gray-700/80 hover:bg-blue-900/60 hover:text-blue-300 text-gray-400 border border-gray-600 hover:border-blue-600',
          )}
          title="Améliorer ce texte avec l'IA"
        >
          {isLoading ? (
            <>
              <span className="animate-spin text-xs">⟳</span>
              <span>IA…</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Améliorer</span>
            </>
          )}
        </button>
      </div>

      {hint && !suggestion && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}

      {/* Erreur */}
      {showError && (
        <p className="text-xs text-red-400">{showError}</p>
      )}

      {/* Suggestion IA */}
      {suggestion && (
        <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-300">✨ Suggestion IA</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="text-xs text-green-400 hover:text-green-300 font-medium"
              >
                Accepter
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="text-xs text-gray-500 hover:text-gray-300"
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
