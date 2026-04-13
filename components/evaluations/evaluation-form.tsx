'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { submitEvaluation } from '@/actions/evaluations'
import { useExpertMode } from '@/hooks/useExpertMode'

type Criterion = {
  id: string
  label: string
  description: string | null
  weight: number
  order_index: number
}

type EvaluationFormProps = {
  projectId: string
  criteria: Criterion[]
}

// Scores initiaux à -1 pour détecter les champs non remplis
type Scores = Record<string, number>

export function EvaluationForm({ projectId, criteria }: EvaluationFormProps): React.JSX.Element {
  const router = useRouter()
  const { isExpert } = useExpertMode()

  const [scores, setScores] = useState<Scores>(
    Object.fromEntries(criteria.map((c) => [c.id, -1])),
  )
  const [commentary, setCommentary] = useState('')
  const [redTeam, setRedTeam] = useState({
    strongest_argument_against: '',
    blind_spots: '',
    conditions_for_success: '',
  })
  const [showRedTeam, setShowRedTeam] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const allScored = criteria.every((c) => scores[c.id] !== undefined && scores[c.id] >= 0)
  const commentaryOk = commentary.trim().length >= 50

  const weightedAvg =
    allScored
      ? criteria.reduce((acc, c) => acc + (scores[c.id] ?? 0) * (c.weight / 100), 0)
      : null

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [criterionId]: value }))
  }

  const handleSubmit = async () => {
    if (!allScored) {
      toast.error('Notez tous les critères avant de soumettre')
      return
    }
    if (!commentaryOk) {
      toast.error('Le commentaire doit faire au moins 50 caractères')
      return
    }

    setIsSubmitting(true)
    setShowConfirm(false)

    const result = await submitEvaluation(projectId, {
      scores: Object.fromEntries(
        Object.entries(scores).filter(([, v]) => v >= 0),
      ),
      commentary: commentary.trim(),
      red_team: showRedTeam && redTeam.strongest_argument_against.length >= 30
        ? redTeam
        : undefined,
    })

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors de la soumission')
      return
    }

    toast.success('Évaluation soumise — merci pour votre contribution')
    router.push(`/projects/${projectId}`)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Bannière mode expert */}
        {isExpert && (
          <div className="flex items-center justify-between bg-blue-950/20 border border-blue-800/40 rounded-xl px-4 py-2">
            <p className="text-xs text-blue-400 font-medium">Mode Expert activé — tous les champs avancés sont visibles</p>
            <a href="/settings/preferences" className="text-xs text-blue-500 hover:text-blue-300 transition-colors">
              Modifier →
            </a>
          </div>
        )}

        {/* Critères */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">Critères d&apos;évaluation</h2>
            {weightedAvg !== null && (
              <span className="text-sm font-bold text-blue-400">
                Score pondéré : {weightedAvg.toFixed(1)} / 10
              </span>
            )}
          </div>

          {criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-300">{criterion.label}</p>
                  {criterion.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{criterion.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  Poids : {criterion.weight}%
                </span>
              </div>

              <ScoreSlider
                value={scores[criterion.id] ?? -1}
                onChange={(v) => handleScoreChange(criterion.id, v)}
              />
            </div>
          ))}
        </div>

        {/* Commentaire */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">Commentaire d&apos;évaluation *</h2>
            <span className={cn('text-xs', commentaryOk ? 'text-green-500' : 'text-gray-500')}>
              {commentary.trim().length}/50 min {commentaryOk && '✓'}
            </span>
          </div>
          <textarea
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={5}
            placeholder="Expliquez votre notation en détail. Justifiez les scores extrêmes. Identifiez les forces et faiblesses du projet. Votre commentaire est précieux pour l'équipe…"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            maxLength={2000}
          />
        </div>

        {/* Red Team (optionnel — affiché par défaut en mode expert) */}
        <div className={cn(
          'rounded-xl p-5 space-y-3',
          isExpert || showRedTeam
            ? 'bg-red-950/10 border border-red-900/40'
            : 'bg-gray-900 border border-gray-800',
        )}>
          <button
            type="button"
            onClick={() => setShowRedTeam((v) => !v)}
            className="flex items-center gap-2 w-full text-left"
            disabled={isExpert}
          >
            <span className={cn(
              'text-sm font-semibold',
              isExpert || showRedTeam ? 'text-red-400' : 'text-gray-200',
            )}>
              🔴 Red Team {isExpert ? '' : '(optionnel)'}
            </span>
            {!isExpert && (
              <span className="text-xs text-gray-500 ml-auto">{showRedTeam ? 'Masquer' : 'Ajouter'}</span>
            )}
            {isExpert && (
              <span className="text-xs text-blue-500 ml-auto">Mode expert — affiché par défaut</span>
            )}
          </button>

          {(isExpert || showRedTeam) && (
            <div className="space-y-4 pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Exercice de contre-argumentation structurée. Imaginez que le projet soit un échec —
                pourquoi cela s&apos;est-il produit ?
              </p>

              <RedTeamField
                label="Argument le plus fort contre ce projet *"
                placeholder="La faiblesse principale est que le marché adressable est trop restreint pour générer un MOIC de 3×…"
                value={redTeam.strongest_argument_against}
                onChange={(v) => setRedTeam((prev) => ({ ...prev, strongest_argument_against: v }))}
                minLength={30}
              />

              <RedTeamField
                label="Angles morts identifiés"
                placeholder="L'équipe semble ignorer la menace concurrentielle de [acteur X] qui dispose d'un avantage…"
                value={redTeam.blind_spots}
                onChange={(v) => setRedTeam((prev) => ({ ...prev, blind_spots: v }))}
                minLength={20}
              />

              <RedTeamField
                label="Conditions nécessaires au succès"
                placeholder="Pour que ce projet réussisse, il faut impérativement que [condition A] et [condition B] soient réunies…"
                value={redTeam.conditions_for_success}
                onChange={(v) => setRedTeam((prev) => ({ ...prev, conditions_for_success: v }))}
                minLength={20}
              />
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Une fois soumise, votre évaluation ne peut plus être modifiée.
          </p>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!allScored || !commentaryOk || isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Soumission…' : 'Soumettre mon évaluation'}
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-white">Confirmer la soumission</h2>
            <p className="text-sm text-gray-400">
              Votre évaluation avec un score pondéré de{' '}
              <strong className="text-white">{weightedAvg?.toFixed(2)} / 10</strong> sera soumise de
              façon définitive. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function ScoreSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}): React.JSX.Element {
  const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const getColor = (score: number): string => {
    if (score <= 3) return 'bg-red-600'
    if (score <= 5) return 'bg-yellow-600'
    if (score <= 7) return 'bg-blue-600'
    return 'bg-green-600'
  }

  return (
    <div className="flex items-center gap-1.5">
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={cn(
            'flex-1 h-8 rounded text-xs font-bold transition-all',
            value === score
              ? cn(getColor(score), 'text-white scale-105')
              : value > score
                ? cn(getColor(value), 'opacity-30 text-white')
                : 'bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-gray-300',
          )}
        >
          {score}
        </button>
      ))}
      {value >= 0 && (
        <span className="ml-1 text-xs text-gray-400 w-8 text-right shrink-0">{value}/10</span>
      )}
    </div>
  )
}

function RedTeamField({
  label,
  placeholder,
  value,
  onChange,
  minLength,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  minLength: number
}): React.JSX.Element {
  const ok = value.trim().length >= minLength

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className={cn('text-xs', ok ? 'text-green-500' : 'text-gray-600')}>
          {value.trim().length}/{minLength} {ok && '✓'}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors resize-none"
      />
    </div>
  )
}
