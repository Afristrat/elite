'use client'

import { useState, useTransition } from 'react'
import { submitPreMortemResponse, closePreMortem } from '@/actions/premortems'

type Props = {
  projectId: string
  hasAlreadySubmitted: boolean
  isAdmin: boolean
  isClosed: boolean
  totalResponses: number
}

export function PreMortemForm({ projectId, hasAlreadySubmitted, isAdmin, isClosed, totalResponses }: Props): React.JSX.Element {
  const [failureScenario, setFailureScenario] = useState('')
  const [majorRisks, setMajorRisks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [closeConfirm, setCloseConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (isClosed) {
    return (
      <div className="bg-green-950/20 border border-green-800/40 rounded-xl p-4">
        <p className="text-green-400 text-sm font-medium">Phase Pre-Mortem clôturée</p>
        <p className="text-green-600 text-xs mt-1">
          Le projet est maintenant ouvert à l&apos;évaluation.
        </p>
      </div>
    )
  }

  if (hasAlreadySubmitted && !isAdmin) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-green-400 text-sm font-medium">Contribution soumise ✓</p>
        <p className="text-gray-500 text-xs mt-1">
          Merci pour votre contribution. L&apos;admin clôturera le Pre-Mortem pour ouvrir l&apos;évaluation.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-green-950/20 border border-green-800/40 rounded-xl p-4">
        <p className="text-green-400 text-sm font-medium">Réponse enregistrée ✓</p>
        <p className="text-gray-500 text-xs mt-1">
          Votre scénario d&apos;échec et vos risques ont bien été soumis.
        </p>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await submitPreMortemResponse(projectId, {
        failure_scenario: failureScenario,
        major_risks: majorRisks,
      })
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  function handleClose(): void {
    setError(null)
    startTransition(async () => {
      const result = await closePreMortem(projectId)
      if (!result.success) {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  return (
    <div className="space-y-4">
      {!hasAlreadySubmitted && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">
              Si ce projet échouait dans 18 mois, à quoi ressemblerait cet échec ?
            </label>
            <textarea
              value={failureScenario}
              onChange={(e) => { setFailureScenario(e.target.value) }}
              rows={4}
              placeholder="Décrivez le scénario d'échec le plus plausible..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              required
              minLength={20}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">
              Quels sont les risques majeurs que nous sous-estimons ?
            </label>
            <textarea
              value={majorRisks}
              onChange={(e) => { setMajorRisks(e.target.value) }}
              rows={4}
              placeholder="Risques de marché, opérationnels, équipe, technologie..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              required
              minLength={20}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isPending ? 'Soumission…' : 'Soumettre ma contribution Pre-Mortem'}
          </button>
        </form>
      )}

      {isAdmin && (
        <div className="bg-gray-900 border border-orange-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-300">Clôturer le Pre-Mortem</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalResponses} contribution{totalResponses !== 1 ? 's' : ''} reçue{totalResponses !== 1 ? 's' : ''} — ouvre le projet à l&apos;évaluation
              </p>
            </div>
          </div>
          {!closeConfirm ? (
            <button
              type="button"
              onClick={() => { setCloseConfirm(true) }}
              className="px-4 py-2 text-sm font-medium bg-orange-800 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Clôturer et ouvrir à l&apos;évaluation
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isPending ? 'Clôture…' : 'Confirmer la clôture'}
              </button>
              <button
                type="button"
                onClick={() => { setCloseConfirm(false) }}
                className="text-sm text-gray-500 hover:text-gray-300"
              >
                Annuler
              </button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
