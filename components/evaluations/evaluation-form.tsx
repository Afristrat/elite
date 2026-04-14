'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { submitEvaluation } from '@/actions/evaluations'
import { useExpertMode } from '@/hooks/useExpertMode'
import { AITextArea } from '@/components/ui/ai-textarea'

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
          <div className="flex items-center justify-between bg-primary-container/10 border border-primary-container/30 rounded-xl px-4 py-2">
            <p className="text-xs text-na-primary font-medium">Mode Expert activé — tous les champs avancés sont visibles</p>
            <a href="/settings/preferences" className="text-xs text-na-primary hover:text-on-surface-variant transition-colors">
              Modifier →
            </a>
          </div>
        )}

        {/* Critères */}
        <div className="bg-surface-container rounded-xl p-8 border border-border/10 space-y-10" data-tour="evaluation-criteria">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-on-surface flex items-center gap-2">
              <span className="text-na-primary">◆</span>
              Critères d&apos;évaluation
            </h2>
            {weightedAvg !== null && (
              <div className="text-right">
                <p className="text-on-surface-variant text-sm uppercase tracking-wider font-semibold">Score pondéré estimé</p>
                <p className="text-2xl font-bold text-na-primary">
                  {weightedAvg.toFixed(2)} <span className="text-on-surface-variant text-lg">/ 10</span>
                </p>
              </div>
            )}
          </div>

          {criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-on-surface">{criterion.label}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                    {criterion.weight}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant uppercase">Score</span>
                </div>
              </div>
              {criterion.description && (
                <p className="text-xs text-on-surface-variant/70">{criterion.description}</p>
              )}
              <ScoreSlider
                value={scores[criterion.id] ?? -1}
                onChange={(v) => handleScoreChange(criterion.id, v)}
              />
            </div>
          ))}
        </div>

        {/* Commentaire */}
        <div className="bg-surface-container rounded-xl p-8 border border-border/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-on-surface">Commentaire d&apos;évaluation *</h2>
            <span className={cn('text-xs font-mono', commentaryOk ? 'text-na-tertiary-dim' : 'text-on-surface-variant/50')}>
              {commentary.trim().length}/50 min {commentaryOk && '✓'}
            </span>
          </div>
          <AITextArea
            value={commentary}
            onChange={setCommentary}
            field="commentary"
            rows={5}
            placeholder="Expliquez votre notation en détail. Justifiez les scores extrêmes. Identifiez les forces et faiblesses du projet. Votre commentaire est précieux pour l'équipe…"
            maxLength={2000}
          />
        </div>

        {/* Red Team (optionnel — affiché par défaut en mode expert) */}
        <div data-tour="red-team-section" className={cn(
          'rounded-xl p-8 space-y-4',
          isExpert || showRedTeam
            ? 'bg-na-error-container/10 border border-na-error-container/30'
            : 'bg-surface-container border border-border/10',
        )}>
          <button
            type="button"
            onClick={() => setShowRedTeam((v) => !v)}
            className="flex items-center gap-2 w-full text-left"
            disabled={isExpert}
          >
            <div className="flex items-center gap-3">
              {(isExpert || showRedTeam) && (
                <div className="w-10 h-10 rounded-full bg-na-error-container/20 flex items-center justify-center">
                  <span className="text-na-error text-sm">🔴</span>
                </div>
              )}
              <span className={cn(
                'font-bold',
                isExpert || showRedTeam ? 'text-na-error' : 'text-on-surface',
              )}>
                Red Team {isExpert ? '' : '— L\'avocat du diable'}
              </span>
            </div>
            {!isExpert && (
              <span className="text-xs text-on-surface-variant ml-auto">{showRedTeam ? 'Masquer' : 'Ajouter'}</span>
            )}
            {isExpert && (
              <span className="text-xs text-na-primary ml-auto">Mode expert — affiché par défaut</span>
            )}
          </button>

          {(isExpert || showRedTeam) && (
            <div className="space-y-6 pt-2 border-t border-na-error/10">
              <p className="text-xs text-on-surface-variant">
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
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/10">
          <p className="text-xs text-on-surface-variant">
            Une fois soumise, votre évaluation ne peut plus être modifiée.
          </p>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!allScored || !commentaryOk || isSubmitting}
            className="px-8 py-3 bg-primary text-on-primary text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Soumission…' : 'Soumettre mon évaluation'}
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface-container border border-border/10 rounded-xl p-8 max-w-md w-full space-y-6">
            <h2 className="text-lg font-bold text-on-surface">Confirmer la soumission</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Votre évaluation avec un score pondéré de{' '}
              <strong className="text-na-primary">{weightedAvg?.toFixed(2)} / 10</strong> sera soumise de
              façon définitive. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-border/10 text-on-surface-variant hover:text-on-surface rounded-xl text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
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
    if (score <= 3) return 'bg-na-error'
    if (score <= 5) return 'bg-na-secondary'
    if (score <= 7) return 'bg-na-primary'
    return 'bg-na-tertiary-dim'
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
              ? cn(getColor(score), 'text-on-primary scale-105')
              : value > score
                ? cn(getColor(value), 'opacity-30 text-on-primary')
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
          )}
        >
          {score}
        </button>
      ))}
      {value >= 0 && (
        <span className="ml-1 text-xs text-on-surface-variant w-8 text-right shrink-0">{value}/10</span>
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-na-error uppercase tracking-wider">{label}</label>
        <span className={cn('text-xs font-mono', ok ? 'text-na-tertiary-dim' : 'text-on-surface-variant/50')}>
          {value.trim().length}/{minLength} {ok && '✓'}
        </span>
      </div>
      <AITextArea
        value={value}
        onChange={onChange}
        field="red_team"
        rows={3}
        placeholder={placeholder}
      />
    </div>
  )
}
