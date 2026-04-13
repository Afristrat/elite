'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { recordDecision } from '@/actions/decisions'

type DecisionType = 'approved' | 'rejected' | 'deferred'

type DecisionModalProps = {
  projectId: string
  projectTitle: string
  globalScore: number | null
}

const DECISION_OPTIONS: Array<{
  value: DecisionType
  label: string
  description: string
  color: string
}> = [
  {
    value: 'approved',
    label: '✓ Approuver',
    description: 'Le projet est validé pour investissement',
    color: 'border-green-600 bg-green-600/10 text-green-300',
  },
  {
    value: 'rejected',
    label: '✗ Rejeter',
    description: 'Le projet ne sera pas poursuivi',
    color: 'border-red-600 bg-red-600/10 text-red-300',
  },
  {
    value: 'deferred',
    label: '⏸ Différer',
    description: 'Décision mise en attente (Real Options)',
    color: 'border-yellow-600 bg-yellow-600/10 text-yellow-300',
  },
]

export function DecisionModal({ projectId, projectTitle, globalScore }: DecisionModalProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [decision, setDecision] = useState<DecisionType>('approved')
  const [rationale, setRationale] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [realOption, setRealOption] = useState({
    trigger: '',
    trigger_date: '',
    option_value: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rationaleOk = rationale.trim().length >= 100
  const isDeferred = decision === 'deferred'
  const realOptionOk = !isDeferred || (
    realOption.trigger.length >= 10 &&
    realOption.trigger_date.length > 0 &&
    Number(realOption.option_value) > 0 &&
    realOption.description.length >= 20
  )

  const canSubmit = rationaleOk && realOptionOk

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)

    const result = await recordDecision(projectId, {
      decision,
      rationale: rationale.trim(),
      repo_url: repoUrl.trim() || undefined,
      real_option_data: isDeferred
        ? {
            trigger: realOption.trigger.trim(),
            trigger_date: realOption.trigger_date,
            option_value: Number(realOption.option_value),
            description: realOption.description.trim(),
          }
        : undefined,
    })

    // Si redirect() est appelé, on n'arrive pas ici — mais en cas d'erreur :
    if (result && !result.success) {
      toast.error(result.error ?? 'Erreur lors de la décision')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Prendre une décision
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full space-y-5 my-auto">
            <div>
              <h2 className="text-xl font-bold text-white">Prise de décision</h2>
              <p className="text-sm text-gray-400 mt-1">{projectTitle}</p>
              {globalScore !== null && (
                <p className="text-sm text-gray-500 mt-0.5">Score moyen : {globalScore.toFixed(2)} / 10</p>
              )}
            </div>

            {/* Choix de décision */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Décision *</label>
              <div className="grid grid-cols-3 gap-3">
                {DECISION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecision(opt.value)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-colors',
                      decision === opt.value ? opt.color : 'border-gray-700 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Justification *</label>
                <span className={cn('text-xs', rationaleOk ? 'text-green-500' : 'text-gray-500')}>
                  {rationale.trim().length}/100 min {rationaleOk && '✓'}
                </span>
              </div>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={5}
                placeholder="Motivez votre décision en vous appuyant sur les critères d'évaluation, le consensus du groupe, et les conditions de marché. Min 100 caractères…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                maxLength={3000}
              />
            </div>

            {/* URL du repo (si approuvé) */}
            {decision === 'approved' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">URL du repo (optionnel)</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/…"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Real Options (si différé) */}
            {isDeferred && (
              <div className="bg-yellow-950/20 border border-yellow-900/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-yellow-300">Real Options — Conditions de déclenchement</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Déclencheur *</label>
                    <input
                      type="text"
                      value={realOption.trigger}
                      onChange={(e) => setRealOption((p) => ({ ...p, trigger: e.target.value }))}
                      placeholder="Si le marché X atteint Y…"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Date limite *</label>
                    <input
                      type="date"
                      value={realOption.trigger_date}
                      onChange={(e) => setRealOption((p) => ({ ...p, trigger_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Valeur de l&apos;option (MAD/EUR) *</label>
                  <input
                    type="number"
                    value={realOption.option_value}
                    onChange={(e) => setRealOption((p) => ({ ...p, option_value: e.target.value }))}
                    placeholder="50 000"
                    min={0}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Description de l&apos;option *</label>
                  <textarea
                    value={realOption.description}
                    onChange={(e) => setRealOption((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    placeholder="Nous conservons le droit d'investir à ce prix si…"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Avertissement immuabilité */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-xs text-gray-500">
              ⚠ Cette décision sera enregistrée de façon <strong className="text-gray-300">immuable</strong> dans
              l&apos;audit trail. Elle ne pourra jamais être modifiée ou supprimée.
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  'flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  decision === 'approved' ? 'bg-green-700 hover:bg-green-600' : '',
                  decision === 'rejected' ? 'bg-red-700 hover:bg-red-600' : '',
                  decision === 'deferred' ? 'bg-yellow-700 hover:bg-yellow-600' : '',
                )}
              >
                {isSubmitting ? 'Enregistrement…' : 'Confirmer la décision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
