import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { DecisionModal } from '@/components/decisions/decision-modal'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']
type UserRole = Database['public']['Enums']['user_role']

type ResultsPageProps = {
  params: Promise<{ id: string }>
}

type ScoresRecord = Record<string, number>
type RedTeamData = {
  strongest_argument_against?: string
  blind_spots?: string
  conditions_for_success?: string
}

export default async function ResultsPage({ params }: ResultsPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, proposant_id, quorum_required, quorum_type')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Contributeurs ne voient pas les résultats avant décision
  const canSeeResults: Record<ProjectStatus, boolean> = {
    draft: false,
    'pre-mortem': false,
    open: isAdmin,
    closed: true,
    decided: true,
    archived: true,
  }

  if (!canSeeResults[project.status]) {
    return (
      <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center space-y-2">
        <p className="text-on-surface font-medium">Résultats non disponibles</p>
        <p className="text-on-surface-variant text-sm">
          {project.status === 'open'
            ? 'Les résultats seront visibles une fois le quorum atteint'
            : 'Ce projet n\'est pas encore en phase de résultats'}
        </p>
      </div>
    )
  }

  // Récupérer les évaluations — deux requêtes distinctes selon le rôle (Supabase parse statiquement le select)
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('id, scores, commentary, red_team, submitted_at, evaluateur_id')
    .eq('project_id', id)
    .order('submitted_at')

  // Pour admin : noms des évaluateurs via profiles
  type EvaluatorProfile = { id: string; full_name: string | null; email: string }
  let evaluatorProfiles: EvaluatorProfile[] = []
  if (isAdmin && evaluations?.length) {
    const ids = evaluations.map((e) => e.evaluateur_id).filter(Boolean) as string[]
    if (ids.length) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ids)
      evaluatorProfiles = profilesData ?? []
    }
  }

  // Récupérer les critères
  const { data: projectCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .eq('project_id', id)
    .order('order_index')

  const { data: defaultCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .is('project_id', null)
    .order('order_index')

  const criteria = (projectCriteria?.length ? projectCriteria : defaultCriteria) ?? []

  // Récupérer les stats de la vue
  const { data: stats } = await supabase
    .from('project_evaluation_stats')
    .select('*')
    .eq('project_id', id)
    .single()

  if (!evaluations?.length) {
    return (
      <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
        <p className="text-on-surface-variant text-sm">Aucune évaluation soumise pour l&apos;instant</p>
      </div>
    )
  }

  // Calcul des scores agrégés par critère
  const criteriaAverages = criteria.map((criterion) => {
    const criterionScores = evaluations
      .map((e) => {
        const scores = e.scores as ScoresRecord
        return scores[criterion.id]
      })
      .filter((s): s is number => s !== undefined && s !== null)

    const avg = criterionScores.length > 0
      ? criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length
      : null

    return { ...criterion, avg, count: criterionScores.length }
  })

  // Score global pondéré
  const globalScore = criteriaAverages.every((c) => c.avg !== null)
    ? criteriaAverages.reduce((acc, c) => acc + (c.avg ?? 0) * (c.weight / 100), 0)
    : stats?.avg_score ?? null

  // Agrégat Red Team
  const redTeamResponses = evaluations
    .map((e) => e.red_team as RedTeamData | null)
    .filter((r): r is RedTeamData => r !== null && Object.keys(r).length > 0)

  const quorumReached = stats?.quorum_reached ?? false

  return (
    <div className="space-y-8 max-w-4xl">
      {/* En-tête */}
      <div className="flex justify-between items-end">
        <div>
          <Link
            href={`/projects/${id}`}
            className="text-on-surface-variant text-xs hover:text-na-primary transition-colors flex items-center gap-1 mb-2"
          >
            ← {project.title}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">
              Résultats de l&apos;Évaluation
            </h1>
            {quorumReached && (
              <span className="px-3 py-1 bg-na-tertiary-container/10 text-na-tertiary-dim font-semibold text-xs rounded-full border border-na-tertiary-dim/20 flex items-center gap-1">
                ✓ Quorum atteint
              </span>
            )}
          </div>
        </div>

        {isAdmin && project.status === 'closed' && (
          <DecisionModal
            projectId={id}
            projectTitle={project.title}
            globalScore={globalScore}
          />
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-surface-container border border-na-primary/20 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <p className="text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-2">
            Score global
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-on-surface">
              {globalScore !== null ? globalScore.toFixed(2) : '—'}
            </span>
            <span className="text-on-surface-variant font-medium">/ 10</span>
          </div>
        </div>
        <div className={cn(
          'bg-surface-container p-6 rounded-xl border',
          quorumReached ? 'border-na-tertiary-dim/20' : 'border-border/10',
        )}>
          <p className="text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-2">
            Évaluations
          </p>
          <div className="flex items-center gap-2">
            <span className={cn('text-4xl font-bold', quorumReached ? 'text-na-tertiary-dim' : 'text-on-surface')}>
              {evaluations.length}
            </span>
            <span className="text-on-surface-variant font-medium">/ {project.quorum_required} reçues</span>
          </div>
        </div>
        <div className={cn(
          'bg-surface-container p-6 rounded-xl border',
          quorumReached ? 'border-na-tertiary-dim/20' : 'border-border/10',
        )}>
          <p className="text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-2">
            Quorum
          </p>
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-bold',
              quorumReached ? 'text-4xl text-na-tertiary-dim' : 'text-2xl text-na-secondary italic font-semibold',
            )}>
              {quorumReached ? 'Atteint' : 'En cours…'}
            </span>
            {quorumReached && <span className="text-na-tertiary-dim text-3xl">✓</span>}
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Scores par critère */}
        <div className="lg:col-span-2 space-y-8">
          {criteria.length > 0 && (
            <section className="bg-surface-container-low border border-border/10 rounded-xl p-8">
              <h2 className="text-lg font-semibold mb-8 flex items-center gap-2 text-on-surface">
                <span className="text-na-primary">◆</span>
                Détails de la notation par critère
              </h2>
              <div className="space-y-8">
                {criteriaAverages.map((criterion) => (
                  <div key={criterion.id}>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <span className="text-on-surface font-semibold">{criterion.label}</span>
                        <span className="text-[10px] text-on-surface-variant ml-2 uppercase tracking-wider">
                          Pondération {criterion.weight}%
                        </span>
                      </div>
                      <span className={cn('font-bold text-lg', getScoreColor(criterion.avg))}>
                        {criterion.avg !== null ? criterion.avg.toFixed(1) : '—'}
                        <span className="text-xs text-on-surface-variant font-normal">/10</span>
                      </span>
                    </div>
                    {criterion.avg !== null && (
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', getScoreBarColor(criterion.avg))}
                          style={{ width: `${(criterion.avg / 10) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-6 mt-6 border-t border-border/10 flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold tracking-wide uppercase text-sm">
                  Score final pondéré
                </span>
                <span className="text-2xl font-bold text-na-primary tracking-tight">
                  {globalScore !== null ? `${globalScore.toFixed(2)} / 10` : '—'}
                </span>
              </div>
            </section>
          )}

          {/* Red Team agrégé */}
          {redTeamResponses.length > 0 && (
            <section className="bg-na-error-container/10 border border-na-error-container/40 rounded-xl p-8">
              <h2 className="text-lg font-semibold text-na-error mb-4 flex items-center gap-2">
                <span>⚠</span>
                Points de vigilance (Red Team) — {redTeamResponses.length} contribution{redTeamResponses.length > 1 ? 's' : ''}
              </h2>
              <ul className="space-y-4 text-on-surface/80 text-sm">
                {redTeamResponses.map((rt, i) => (
                  <li key={i} className="space-y-3 border-t border-na-error/10 pt-4 first:border-0 first:pt-0">
                    {rt.strongest_argument_against && (
                      <div className="flex gap-3">
                        <span className="text-na-error mt-0.5 shrink-0">•</span>
                        <p>
                          <span className="font-bold text-on-surface">Argument contre :</span>{' '}
                          {rt.strongest_argument_against}
                        </p>
                      </div>
                    )}
                    {rt.blind_spots && (
                      <div className="flex gap-3">
                        <span className="text-na-error mt-0.5 shrink-0">•</span>
                        <p>
                          <span className="font-bold text-on-surface">Angles morts :</span>{' '}
                          {rt.blind_spots}
                        </p>
                      </div>
                    )}
                    {rt.conditions_for_success && (
                      <div className="flex gap-3">
                        <span className="text-na-error mt-0.5 shrink-0">•</span>
                        <p>
                          <span className="font-bold text-on-surface">Conditions de succès :</span>{' '}
                          {rt.conditions_for_success}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Commentaires */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 px-2 text-on-surface">
            <span className="text-on-surface-variant">💬</span>
            Commentaires ({evaluations.length})
          </h2>
          <div className="space-y-4">
            {evaluations.map((evaluation, i) => {
              const scoreRecord = evaluation.scores as ScoresRecord
              const evalGlobalScore = criteria.length > 0
                ? criteria.reduce((acc, c) => {
                    const s = scoreRecord[c.id]
                    return acc + (s !== undefined ? s * (c.weight / 100) : 0)
                  }, 0)
                : null

              const evaluatorProfile = isAdmin
                ? evaluatorProfiles.find((p) => p.id === evaluation.evaluateur_id)
                : null
              const evaluatorName = evaluatorProfile
                ? (evaluatorProfile.full_name ?? evaluatorProfile.email)
                : `Évaluateur ${i + 1}`

              return (
                <div
                  key={evaluation.id}
                  className="bg-surface-container-low/50 p-6 rounded-xl border border-border/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-na-primary">
                        #{i + 1}
                      </div>
                      <span className="text-xs text-on-surface-variant">{evaluatorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {evalGlobalScore !== null && (
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', getScoreBadge(evalGlobalScore))}>
                          {evalGlobalScore.toFixed(1)} / 10
                        </span>
                      )}
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {new Date(evaluation.submitted_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface/90 leading-relaxed italic">
                    &ldquo;{evaluation.commentary}&rdquo;
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-on-surface-variant'
  if (score >= 8) return 'text-na-tertiary-dim'
  if (score >= 6) return 'text-na-primary'
  if (score >= 4) return 'text-na-secondary'
  return 'text-na-error'
}

function getScoreBarColor(score: number): string {
  if (score >= 8) return 'bg-na-tertiary-dim'
  if (score >= 6) return 'bg-na-primary'
  if (score >= 4) return 'bg-na-secondary'
  return 'bg-na-error'
}

function getScoreBadge(score: number): string {
  if (score >= 8) return 'bg-na-tertiary-container/20 text-na-tertiary-dim'
  if (score >= 6) return 'bg-primary-container/20 text-na-primary'
  if (score >= 4) return 'bg-na-secondary-container/20 text-na-secondary'
  return 'bg-na-error-container/20 text-na-error'
}

// Type pour le rôle — non utilisé directement mais nécessaire pour la type-safety
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _UserRole = UserRole
