'use client'

import { useState } from 'react'
import Link from 'next/link'

type OnboardingStep = {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

type OnboardingChecklistProps = {
  steps: OnboardingStep[]
  onDismiss: () => void
}

export function OnboardingChecklist({ steps, onDismiss }: OnboardingChecklistProps): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const completedCount = steps.filter((s) => s.completed).length
  const allDone = completedCount === steps.length
  const pct = Math.round((completedCount / steps.length) * 100)

  function handleDismiss(): void {
    setDismissed(true)
    onDismiss()
  }

  return (
    <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">
            {allDone ? 'Bienvenue — configuration terminée ✓' : 'Prise en main de la plateforme'}
          </h2>
          <p className="text-xs text-gray-400">
            {allDone
              ? 'Vous êtes prêt à utiliser toutes les fonctionnalités.'
              : `${completedCount} / ${steps.length} étapes complétées`}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-600 hover:text-gray-400 transition-colors text-lg leading-none shrink-0"
          aria-label="Fermer l'onboarding"
        >
          ×
        </button>
      </div>

      {/* Barre de progression */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Étapes */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              step.completed ? 'opacity-50' : 'hover:bg-white/5'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                step.completed
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-600'
              }`}
            >
              {step.completed && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </div>
            <div className="min-w-0">
              {step.completed ? (
                <p className="text-sm font-medium text-gray-400 line-through">{step.title}</p>
              ) : (
                <Link
                  href={step.href}
                  className="text-sm font-medium text-white hover:text-blue-300 transition-colors"
                >
                  {step.title}
                </Link>
              )}
              <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
